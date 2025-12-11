'use client';
import { Facebook, Linkedin, Twitter, Share2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShareButtons({ title, url }: { title: string, url: string }) {
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : `https://pharma2g.com${url}`;
    
    const shareTargets = [
        {
          name: 'WhatsApp',
          href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20-%20${encodeURIComponent(fullUrl)}`,
          icon: <MessageCircle className="h-4 w-4" />
        },
        {
          name: 'Telegram',
          href: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
          icon: <Send className="h-4 w-4" />
        },
        {
          name: 'Facebook',
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
          icon: <Facebook className="h-4 w-4" />
        },
    ];

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: `Check out this article on pharmA2G: ${title}`,
                url: fullUrl,
            }).catch(console.error);
        }
    };
    
    if (typeof navigator !== 'undefined' && navigator.share) {
        return (
            <Button onClick={handleNativeShare} size="sm" variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {shareTargets.map(t => (
                <Button key={t.name} asChild size="icon" variant="outline">
                    <a href={t.href} target="_blank" rel="noopener noreferrer" title={`Share on ${t.name}`}>
                         {t.icon}
                         <span className="sr-only">Share on {t.name}</span>
                    </a>
                </Button>
            ))}
        </div>
    );
}
