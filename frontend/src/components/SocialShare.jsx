import { Twitter, Linkedin, Facebook, Link2, Check, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';

/**
 * SocialShare Component
 * Reusable social sharing buttons for articles
 * 
 * @param {string} url - The URL to share
 * @param {string} title - The title of the content
 * @param {string} summary - Optional summary/description
 */
export default function SocialShare({ url, title, summary = '' }) {
    const [copied, setCopied] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedSummary = encodeURIComponent(summary);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const buttonBase = "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 border";

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: summary,
                    url: url
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Share</span>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {/* Native Share (Mobile) */}
                {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                        onClick={handleNativeShare}
                        className={`${buttonBase} bg-blue-600/20 border-blue-600/50 text-blue-400 hover:bg-blue-600 hover:text-white md:hidden shrink-0`}
                        title="Share via..."
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                )}

                {/* Twitter/X */}
                <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonBase} bg-slate-800/50 border-slate-700 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 hover:text-[#1DA1F2] text-slate-400 shrink-0`}
                    title="Share on Twitter"
                >
                    <Twitter className="w-4 h-4" />
                </a>

                {/* LinkedIn */}
                <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonBase} bg-slate-800/50 border-slate-700 hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/50 hover:text-[#0A66C2] text-slate-400 shrink-0`}
                    title="Share on LinkedIn"
                >
                    <Linkedin className="w-4 h-4" />
                </a>

                {/* Facebook */}
                <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonBase} bg-slate-800/50 border-slate-700 hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 hover:text-[#1877F2] text-slate-400 shrink-0`}
                    title="Share on Facebook"
                >
                    <Facebook className="w-4 h-4" />
                </a>

                {/* WhatsApp */}
                <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonBase} bg-slate-800/50 border-slate-700 hover:bg-[#25D366]/20 hover:border-[#25D366]/50 hover:text-[#25D366] text-slate-400 shrink-0`}
                    title="Share on WhatsApp"
                >
                    <MessageCircle className="w-4 h-4" />
                </a>

                {/* Copy Link */}
                <button
                    onClick={handleCopyLink}
                    className={`${buttonBase} shrink-0 ${copied
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-slate-300'}`}
                    title={copied ? 'Copied!' : 'Copy link'}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
