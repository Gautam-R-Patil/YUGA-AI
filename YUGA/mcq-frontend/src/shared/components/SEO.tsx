import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    type = "website",
}: SEOProps) => {
    const siteTitle = "YUGA AI - Your Interactive and Personalized AI Education Platform";
    const siteDescription = "YUGA AI - Revolutionary AI-powered education platform with interactive avatars and personalized learning experiences";
    const siteKeywords = "AI education, interactive learning, AI tutor, online courses, personalized education";
    const siteUrl = window.location.origin;
    const siteImage = `${siteUrl}/yuga-og-image.jpg`; // Ensure we have a default OG image

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title ? `${title} | YUGA AI` : siteTitle}</title>
            <meta name="description" content={description || siteDescription} />
            <meta name="keywords" content={keywords || siteKeywords} />

            {/* Open Graph Metadata */}
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={description || siteDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url || window.location.href} />
            <meta property="og:image" content={image || siteImage} />

            {/* Twitter Metadata */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteTitle} />
            <meta name="twitter:description" content={description || siteDescription} />
            <meta name="twitter:image" content={image || siteImage} />

            {/* Canonical URL */}
            <link rel="canonical" href={url || window.location.href} />
        </Helmet>
    );
};
