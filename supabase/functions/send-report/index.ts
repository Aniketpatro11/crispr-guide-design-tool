import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // Max 5 emails per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour window

interface GuideData {
  rank: number;
  sequence: string;
  pam: string;
  gcPercent: string;
  score: string;
  position: string;
}

interface ReportRequest {
  email: string;
  reportType: "summary" | "full";
  casSystem: string;
  pamSequence: string;
  guideLength: number;
  gcRange: [number, number];
  sequenceLength: number;
  totalGuides: number;
  avgScore: string;
  topGuides: GuideData[];
  generatedAt: string;
}

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return String(text);
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validate DNA sequence contains only valid characters
function isValidDnaSequence(sequence: string): boolean {
  return /^[ATGCatgcNn\s-]*$/.test(sequence);
}

// Validate email format more strictly
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Check rate limit for an IP
function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

const generateEmailHtml = (data: ReportRequest): string => {
  const guidesTableRows = data.topGuides
    .map(
      (g) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">#${escapeHtml(String(g.rank))}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: 'Courier New', monospace; color: #0a8f5b; font-weight: 600;">${escapeHtml(g.sequence)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: 'Courier New', monospace; color: #d83a3a; font-weight: 700;">${escapeHtml(g.pam)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(g.gcPercent)}%</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${escapeHtml(g.score)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${escapeHtml(g.position)}</td>
      </tr>
    `
    )
    .join("");

  // Escape all user-controlled data
  const safeCasSystem = escapeHtml(data.casSystem);
  const safePamSequence = escapeHtml(data.pamSequence);
  const safeGuideLength = escapeHtml(String(data.guideLength));
  const safeGcRange0 = escapeHtml(String(data.gcRange[0]));
  const safeGcRange1 = escapeHtml(String(data.gcRange[1]));
  const safeSequenceLength = escapeHtml(String(data.sequenceLength));
  const safeTotalGuides = escapeHtml(String(data.totalGuides));
  const safeAvgScore = escapeHtml(data.avgScore);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CRISPR Guide Design Report</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 640px; margin: 0 auto; padding: 40px 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1C6FFF 0%, #3B82F6 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🧬</div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">CRISPR Guide Design Report</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">
              Generated on ${new Date(data.generatedAt).toLocaleDateString()} at ${new Date(data.generatedAt).toLocaleTimeString()}
            </p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Configuration Summary -->
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
              📋 Analysis Configuration
            </h2>
            <table style="width: 100%; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">CRISPR System</td>
                <td style="padding: 8px 0; font-weight: 600; color: #1f2937;">${safeCasSystem}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">PAM Sequence</td>
                <td style="padding: 8px 0; font-family: 'Courier New', monospace; font-weight: 700; color: #d83a3a;">${safePamSequence}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Guide Length</td>
                <td style="padding: 8px 0; font-weight: 600;">${safeGuideLength} nt</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">GC% Range</td>
                <td style="padding: 8px 0; font-weight: 600;">${safeGcRange0}% - ${safeGcRange1}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Sequence Length</td>
                <td style="padding: 8px 0; font-weight: 600;">${safeSequenceLength} bp</td>
              </tr>
            </table>

            <!-- Quick Stats -->
            <div style="display: flex; gap: 16px; margin-bottom: 24px;">
              <div style="flex: 1; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #4F46E5;">${safeTotalGuides}</div>
                <div style="font-size: 12px; color: #6366F1; text-transform: uppercase; letter-spacing: 0.5px;">Guides Found</div>
              </div>
              <div style="flex: 1; background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 12px; padding: 20px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #059669;">${safeAvgScore}</div>
                <div style="font-size: 12px; color: #10B981; text-transform: uppercase; letter-spacing: 0.5px;">Avg Score</div>
              </div>
            </div>

            <!-- Top Guides Table -->
            <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
              🏆 Top 10 Guide RNAs
            </h2>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Rank</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Sequence (5'→3')</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">PAM</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">GC%</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Score</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e5e7eb;">Position</th>
                  </tr>
                </thead>
                <tbody>
                  ${guidesTableRows}
                </tbody>
              </table>
            </div>

            <!-- Interpretation Guide -->
            ${
              data.reportType === "full"
                ? `
            <h2 style="color: #1f2937; font-size: 18px; margin: 32px 0 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
              💡 How to Interpret
            </h2>
            <ul style="color: #4b5563; line-height: 1.7; padding-left: 20px; margin: 0;">
              <li>GC% between 40-60% is optimal for most CRISPR systems</li>
              <li>Lower total score indicates better guide candidates</li>
              <li>Self-complementarity measures potential hairpin formation</li>
              <li>Off-target matches are checked against the input sequence only</li>
            </ul>
            `
                : ""
            }

            <!-- Disclaimer -->
            <div style="margin-top: 32px; padding: 16px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 16px;">⚠️</span>
                <strong style="color: #B91C1C; font-size: 14px;">Educational Disclaimer</strong>
              </div>
              <p style="color: #991B1B; font-size: 13px; margin: 0; line-height: 1.5;">
                This tool is for learning and visualization purposes only. Not intended for experimental or clinical guide design.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">Made with 🧬 by Code Biologist (Aniket)</p>
            <p style="margin: 8px 0 0;">CRISPR Guide Design Tool</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    // Check rate limit
    const { allowed, remaining } = checkRateLimit(clientIp);
    if (!allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "X-RateLimit-Remaining": "0",
            ...corsHeaders 
          } 
        }
      );
    }

    const data: ReportRequest = await req.json();

    // Validate email with stricter check
    if (!data.email || !isValidEmail(data.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate DNA sequences contain only valid characters
    if (data.topGuides && data.topGuides.length > 0) {
      for (const guide of data.topGuides) {
        if (!isValidDnaSequence(guide.sequence) || !isValidDnaSequence(guide.pam)) {
          return new Response(
            JSON.stringify({ error: "Invalid DNA sequence detected" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    }

    // Validate PAM sequence
    if (data.pamSequence && !isValidDnaSequence(data.pamSequence)) {
      return new Response(
        JSON.stringify({ error: "Invalid PAM sequence detected" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate report type
    if (data.reportType && !["summary", "full"].includes(data.reportType)) {
      return new Response(
        JSON.stringify({ error: "Invalid report type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending report to:", data.email, "from IP:", clientIp);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CRISPR Tool <onboarding@resend.dev>",
        to: [data.email],
        subject: `🧬 Your CRISPR Guide Design Report - ${data.totalGuides} Guides Found`,
        html: generateEmailHtml(data),
      }),
    });

    const responseText = await emailResponse.text();

    if (!emailResponse.ok) {
      console.error("Resend API error status:", emailResponse.status);
      
      // Parse error for better messaging - return generic message to client
      let errorMessage = "Failed to send email";
      try {
        const errorData = JSON.parse(responseText);
        // Check for common Resend sandbox limitations
        if (errorData.statusCode === 403 || responseText.includes("verify")) {
          errorMessage = "Email domain not verified. For sandbox mode, emails can only be sent to the account owner's email. Please verify your domain at resend.com/domains for sending to any email.";
        }
      } catch {
        // Use generic error message
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = JSON.parse(responseText);
    console.log("Email sent successfully to:", data.email);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json", 
        "X-RateLimit-Remaining": String(remaining),
        ...corsHeaders 
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-report function:", error);
    // Return generic error message to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);