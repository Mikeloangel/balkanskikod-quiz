import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const BASE_URL = import.meta.env.VITE_APP_BASE_URL?.trim() || 
  new URL(import.meta.env.BASE_URL, window.location.origin).toString().replace(/\/$/, '');

const DEFAULT_IMAGE = `${BASE_URL}/ico.png`;

export const MetaTags = ({ 
  title, 
  description = 'Угадай мелодию по фрагменту и проверь, насколько ты в теме. Балканские хиты в новой форме.', 
  image = DEFAULT_IMAGE,
  url,
  type = 'website'
}: MetaTagsProps) => {
  const location = useLocation();
  const fullUrl = url || `${BASE_URL}${location.hash}`;
  const fullTitle = title ? `${title} | Balkanski kod` : 'Balkanski kod';

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Balkanski kod" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional meta tags */}
      <meta name="theme-color" content="#121212" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    </Helmet>
  );
};
