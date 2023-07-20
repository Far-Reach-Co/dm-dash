declare namespace Express {
  export interface Request {
    user: {
      id: string;
      email: string;
      username: string;
      is_pro: boolean;
      name: string;
      phone: string;
      password: string;
      stripe_id: string;
    };
    token: string;
  }
}
