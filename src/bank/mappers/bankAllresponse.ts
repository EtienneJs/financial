import { Bank } from "../entities/bank.entity";
export interface BankResponseInterface {
    id: string;
    name: string;
    nro_accounts: number;
    total_balance: number;
}
export class BankResponse {
    allbanks( banks: Bank[] ): BankResponseInterface[] {
        return banks.map(bank => ({
            id: bank.id,
            name: bank.name,
            nro_accounts: bank.account.length,
            total_balance: bank.account.reduce((acc, account) => acc + account.current_balance, 0),
        }));
    }
}