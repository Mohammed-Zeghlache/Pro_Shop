import { Star } from 'lucide-react';

export const RatingStars = ({ rating, reviewCount, size = 14 }) => (
  <div className="rating-stars">
    <div className="stars">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size}
          fill={i < Math.floor(rating) ? '#D4AF37' : 'none'}
          color="#D4AF37"
        />
      ))}
    </div>
    {reviewCount && <span className="rating-count">({reviewCount} reviews)</span>}
  </div>
);