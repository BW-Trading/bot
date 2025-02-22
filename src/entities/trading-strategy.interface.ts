export interface ITradingStrategy {
    name: string;
    run(data?: any): Promise<void>;
}
