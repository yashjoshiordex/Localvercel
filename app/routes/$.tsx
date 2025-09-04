import {  type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData} from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Just authenticate without destructuring unused values
    await authenticate.admin(request);
    
    // Instead of redirecting immediately, return the redirect URL data
    const isUrlAuth = !request.headers.get('authorization');
    const redirectUrl = isUrlAuth
      ? `/app?${new URLSearchParams(new URL(request.url).search)}`
      : '/app';
    
    return Response.json({ redirectUrl, authenticated: true });
    } catch (error) {
    console.error("Authentication error:", error);
    
    // If authentication fails, prepare auth redirect URL
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    
    return Response.json({ 
      redirectUrl: `/auth?${searchParams}`, 
      authenticated: false 
    });
  }
};

export default function NotFoundPage() {
  const { redirectUrl, authenticated } = useLoaderData() as { redirectUrl: string; authenticated: boolean };

  const handleNavigate = () => {
    if (authenticated) {
      window.location.href = redirectUrl;
    } 
    };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      flexDirection: "column",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "20px",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>404 - Page Not Found</h1>
      <p style={{ fontSize: "16px", marginBottom: "24px" }}>The page you're looking for doesn't exist.</p>
      
      <button 
        onClick={handleNavigate}
        style={{
          backgroundColor: "#5c6ac4",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "none",
          textDecoration: "none",
          fontWeight: "500",
          cursor: "pointer"
        }}
      >
        Return to App
      </button>
    </div>
  );
}