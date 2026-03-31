// Email templates for CarWiki

export const emailVerificationTemplate = (userName: string, verificationUrl: string) => `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CarWiki - Potvrdite svoj email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); padding: 50px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                🚗 CarWiki
              </h1>
              <p style="margin: 12px 0 0; color: #ffffff; font-size: 17px; opacity: 0.95;">
                Hrvatska baza automobila
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px; color: #f1f5f9;">
              <h2 style="margin: 0 0 24px; color: #93c5fd; font-size: 26px; font-weight: 600;">
                Dobrodošli na CarWiki! 👋
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 17px; line-height: 1.7; color: #f1f5f9;">
                Pozdrav <strong style="color: #ffffff; font-weight: 600;">${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 32px; font-size: 17px; line-height: 1.7; color: #e2e8f0;">
                Hvala što ste se registrirali! Da biste mogli u potpunosti koristiti CarWiki, 
                molimo vas da potvrdite svoju email adresu klikom na gumb ispod.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; 
                              padding: 18px 48px; 
                              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              border-radius: 10px; 
                              font-weight: 600; 
                              font-size: 17px;
                              box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
                              transition: all 0.3s ease;">
                      ✓ Potvrdi email adresu
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 18px; font-size: 15px; line-height: 1.7; color: #cbd5e1;">
                Ako gumb ne radi, kopirajte i zalijepite ovaj link u svoj preglednik:
              </p>
              
              <p style="margin: 0 0 32px; padding: 16px; background-color: #0f172a; border-radius: 8px; border: 1px solid #334155; word-break: break-all;">
                <a href="${verificationUrl}" style="color: #60a5fa; text-decoration: none; font-size: 14px; line-height: 1.6;">
                  ${verificationUrl}
                </a>
              </p>
              
              <div style="border-top: 2px solid #334155; padding-top: 28px; margin-top: 36px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                  ⏱️ <strong style="color: #f1f5f9;">Važno:</strong> Ovaj link vrijedi 24 sata.
                </p>
                <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                  🔒 Ako niste kreirali ovaj račun, možete sigurno ignorirati ovaj email.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 14px; font-size: 15px; color: #94a3b8;">
                Hvala što koristite CarWiki!
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                © ${new Date().getFullYear()} CarWiki. Sva prava pridržana.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const passwordResetTemplate = (userName: string, resetUrl: string) => `
<!DOCTYPE html>
<html lang="hr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CarWiki - Reset lozinke</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 60px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 50px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                🔑 Reset lozinke
              </h1>
              <p style="margin: 12px 0 0; color: #ffffff; font-size: 17px; opacity: 0.95;">
                CarWiki
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px; color: #f1f5f9;">
              <h2 style="margin: 0 0 24px; color: #fcd34d; font-size: 26px; font-weight: 600;">
                Zahtjev za reset lozinke
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 17px; line-height: 1.7; color: #f1f5f9;">
                Pozdrav <strong style="color: #ffffff; font-weight: 600;">${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 32px; font-size: 17px; line-height: 1.7; color: #e2e8f0;">
                Primili smo zahtjev za resetiranje lozinke vašeg CarWiki računa. 
                Kliknite na gumb ispod za postavljanje nove lozinke.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; 
                              padding: 18px 48px; 
                              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              border-radius: 10px; 
                              font-weight: 600; 
                              font-size: 17px;
                              box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
                              transition: all 0.3s ease;">
                      🔓 Resetiraj lozinku
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 18px; font-size: 15px; line-height: 1.7; color: #cbd5e1;">
                Ako gumb ne radi, kopirajte i zalijepite ovaj link u svoj preglednik:
              </p>
              
              <p style="margin: 0 0 32px; padding: 16px; background-color: #0f172a; border-radius: 8px; border: 1px solid #334155; word-break: break-all;">
                <a href="${resetUrl}" style="color: #fbbf24; text-decoration: none; font-size: 14px; line-height: 1.6;">
                  ${resetUrl}
                </a>
              </p>
              
              <div style="border-top: 2px solid #334155; padding-top: 28px; margin-top: 36px;">
                <p style="margin: 0 0 16px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                  ⚠️ <strong style="color: #f1f5f9;">Sigurnost:</strong> Ako niste zatražili reset lozinke, ignorirajte ovaj email.
                </p>
                <p style="margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
                  🔒 Vaša trenutna lozinka ostaje nepromijenjena dok ne kreirate novu.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 14px; font-size: 15px; color: #94a3b8;">
                CarWiki - Hrvatska baza automobila
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">
                © ${new Date().getFullYear()} CarWiki. Sva prava pridržana.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
