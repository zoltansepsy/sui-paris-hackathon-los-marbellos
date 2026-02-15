import { Link } from 'react-router';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Users } from 'lucide-react';
import { Creator } from '../lib/mock-data';

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link to={`/creator/${creator.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback>{creator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold">{creator.name}</h3>
                {creator.suinsName && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {creator.suinsName}
                  </Badge>
                )}
              </div>
              
              {creator.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-6 py-4 bg-muted/50 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span>{creator.contentCount} posts</span>
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{creator.supporterCount}</span>
            </span>
          </div>
          <span className="font-semibold text-foreground">{creator.price} SUI</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
