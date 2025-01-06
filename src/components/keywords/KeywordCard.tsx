import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/components/campaigns/campaignUtils";
import { KeywordStats } from "@/types/tonic";
import "flag-icons/css/flag-icons.min.css";

interface KeywordCardProps extends KeywordStats {}

export const KeywordCard = ({ 
  keyword, 
  campaigns, 
  countries, 
  offers, 
  clicks, 
  revenue, 
  rpc 
}: KeywordCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg">{keyword}</h3>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Campaigns</p>
            <div className="flex flex-wrap gap-2">
              {campaigns.map((campaign) => (
                <Badge 
                  key={campaign.id} 
                  variant={campaign.status === 'active' ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {campaign.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Offers</p>
            <div className="space-y-1">
              {offers.map((offer) => (
                <p key={offer.id} className="text-sm">
                  {offer.name}
                </p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Countries</p>
            <div className="space-y-1">
              {countries.map((country) => (
                <div key={country.code} className="flex items-center gap-2">
                  <span className={`fi fi-${country.code.toLowerCase()}`}></span>
                  <span className="text-sm">{country.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <p className="text-sm text-muted-foreground">RPC</p>
              <p className="font-medium">{formatCurrency(rpc)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clicks</p>
              <p className="font-medium">{clicks.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="font-medium">{formatCurrency(revenue)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordCard;