export interface SponsorshipRequest {
  id: string;
  child_id: string;
  requester_email: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  facebook_url?: string;
  motivation?: string;
  is_long_term?: boolean;
  terms_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface SponsorshipRequestTable {
  Row: SponsorshipRequest;
  Insert: Omit<SponsorshipRequest, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<SponsorshipRequest>;
}