export interface TonicCampaign {
  id: number;
  name: string;
  type: string;
  status: 'active' | 'stopped' | 'pending';
  country: {
    code: string;
    name: string;
  };
  imprint: string;
  offer: {
    id: number;
    name: string;
    vertical: {
      id: number;
      name: string;
    };
  };
  views: number;
  clicks: number;
  revenue: number;
  rpc: number;
  vtc: number;
  rpmv: number;
  trackingLink: string;
  created: string;
}

export interface TonicPagination {
  offset: number;
  limit: number;
  total: number;
}

export interface TonicSorting {
  orderField: string;
  orderOrientation: 'asc' | 'desc';
}

export interface TonicResponse {
  data: TonicCampaign[];
  pagination: TonicPagination;
  sorting: TonicSorting;
}