export const emailTemplateWrapper = (content: string) => `
<table style="border-collapse: collapse; table-layout: fixed; width: 100%; background-color: #fff;" cellpadding="0" cellspacing="0">
  <tr>
    <td>
      <div style="margin: 0 auto; max-width: 600px; min-width: 320px; width: 100%">
        <div style="font-size: 26px; font-weight: 700; line-height: 32px; margin-top: 16px; margin-bottom: 20px; color: #41637e; text-align: center;">
          TrialShopy
        </div>
      </div>
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Courier New', monospace; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; padding: 20px 15px;">
        ${content}
      </div>

      <!-- Footer -->
      <div style="margin: 0 auto; max-width: 600px; min-width: 320px; width: 100%; border-top: 1px solid #999; background-color: #ffffff;">
        <div style="padding: 20px; text-align: center">
          <div style="font-size: 12px; line-height: 19px; color: #999; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-top: 10px;">
            <p style="margin: 0">TrialShopy</p>
            <p style="margin: 0">© ${new Date().getFullYear()} TrialShopy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
`;
