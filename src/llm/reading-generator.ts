export type FortuneReadingRequest = {
  question: string;
  factContext: string;
};

export interface FortuneReadingGenerator {
  generate(request: FortuneReadingRequest): Promise<string>;
}
