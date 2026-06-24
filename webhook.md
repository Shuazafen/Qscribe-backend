 inbound webhook for flw and paystack
 
 proposed webhook endpoint

/api/v1/webhooks/flw/
/api/v1/webhooks/paystack/

KYC provider(SmileID/YouVerify/Dojah)

proposed flow for kyc verification:
User submits BVN + DOB → backend creates a Job in JobRegistry and triggers a background task. The background task pings the KYC provider’s API, receives a callback URL, and redirects the user to the KYC provider's verification page (hosted by the provider). User completes verification. KYC provider sends a webhook to our backend containing the verification result. Backend updates the Job status and User profile.
