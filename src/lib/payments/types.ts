// Payment provider adapter (PRD §39). Application code talks to
// PaymentService, which talks to this interface — never to a specific
// gateway SDK directly. Swapping Paystack/Monnify in later means writing a
// class that implements this interface; nothing above it changes.
export type InitializeParams = {
  amount: number; // minor units
  currency: string;
  email: string;
  reference: string;
  metadata?: Record<string, unknown>;
};

export type InitializeResult = {
  authorizationUrl: string; // where the student is sent to pay
  reference: string;
};

export type VerifyResult = {
  success: boolean;
  amount: number;
  currency: string;
  reference: string;
};

export interface PaymentProvider {
  readonly name: string;
  initialize(params: InitializeParams): Promise<InitializeResult>;
  verify(reference: string): Promise<VerifyResult>;
}
