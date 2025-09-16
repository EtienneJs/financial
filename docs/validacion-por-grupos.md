## Validación en 2 fases con grupos (class-validator + NestJS)

### Objetivo
Ejecutar validaciones de formato/reglas básicas primero y, solo si todas pasan, correr validaciones costosas o con acceso a BD (como `isUnique`).

### Resumen de la solución
- Separamos las reglas en dos grupos de validación:
  - `base`: tipo de datos, rangos, tamaños, `ValidateNested`, tamaños de arreglos, etc.
  - `db`: validaciones que consultan la base de datos (p. ej., `@isUnique`).
- Configuramos el `ValidationPipe` global para que solo ejecute el grupo `base` por defecto.
- Encadenamos dos `ValidationPipe` en los endpoints relevantes para ejecutar primero `base` y, si no hay errores, ejecutar `db`.

### Archivos modificados

#### 1) `src/main.ts`
- Global pipe actualizado para usar únicamente el grupo `base`:
```ts
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    groups: ['base'],
  }),
);
```

#### 2) `src/bank/dto/create-bank-account.dto.ts`
- Reglas de `nro_account`, `type_account` y `current_balance` movidas al grupo `base`.
- `@isUnique(...)` marcado con `groups: ['db']`.
```ts
@IsNumber({}, { groups: ['base'] })
@Min(100000, { groups: ['base'] })
@Max(9999999999, { groups: ['base'] })
@isUnique({ column: 'nro_account', tableName: 'account', type: 'number' }, { groups: ['db'] })
nro_account: number;
```

#### 3) `src/bank/dto/create-bank.dto.ts`
- `name` con validaciones `base`; `@isUnique` con grupo `db`.
- Para el arreglo `account`, `@ArrayMinSize` y `@ValidateNested` están en `base` para evitar ejecutar validaciones internas si el arreglo es inválido.
```ts
@IsString({ groups: ['base'] })
@MinLength(6, { groups: ['base'] })
@isUnique({ column: 'name', tableName: 'banco' }, { groups: ['db'] })
name: string;

@ArrayMinSize(1, { groups: ['base'] })
@ValidateNested({ each: true, groups: ['base'] })
@Type(() => CreateBankAccountDto)
account: CreateBankAccountDto[];
```

#### 4) `src/bank/bank.controller.ts`
- Endpoints con validación encadenada (primero `base`, luego `db`):
```ts
@UsePipes(
  new ValidationPipe({ groups: ['base'] }),
  new ValidationPipe({ groups: ['db'] }),
)
@Post()
create(@Body() dto: CreateBankDto) { ... }

@UsePipes(
  new ValidationPipe({ groups: ['base'] }),
  new ValidationPipe({ groups: ['db'] }),
)
@Post('/create-account/:bankId')
createAccount(@Body() dto: CreateBankAccountDto) { ... }
```

### Por qué pasaba el error antes
El `ValidationPipe` global validaba todo el DTO sin separar grupos. En `CreateBankDto`, el campo `account` es un arreglo de `CreateBankAccountDto`; entonces, al validar cada elemento, también se ejecutaba `@isUnique` de `nro_account`, incluso si ya fallaba `@Max`/`@Min`. De ahí los mensajes tipo `account.0...` y `account.1...` combinando errores base y de BD.

### Cómo funciona ahora
1. Globalmente solo corre `base`. Si hay errores, la petición se corta con 400 y NO se ejecutan validaciones `db`.
2. En los endpoints donde sí queremos `isUnique`, encadenamos otro `ValidationPipe` que corre el grupo `db`. Este segundo pipe solo se ejecuta si el primero no reportó errores.

### Extender a otros endpoints/DTOs
- Para cualquier DTO nuevo:
  - Pon reglas simples en `groups: ['base']`.
  - Pon validaciones con acceso a BD en `groups: ['db']`.
- En el endpoint correspondiente, aplica:
```ts
@UsePipes(
  new ValidationPipe({ groups: ['base'] }),
  new ValidationPipe({ groups: ['db'] }),
)
```

### Notas y buenas prácticas
- Evitar duplicar lógica con `@ValidateIf` para emular reglas base; los grupos son más mantenibles.
- Mantén `useContainer(app.select(AppModule), { fallbackOnErrors: true })` para inyección de dependencias en validadores personalizados.
- Si necesitas que un endpoint no ejecute validaciones `db`, omite el segundo `ValidationPipe` y deja que el global ejecute solo `base`.


