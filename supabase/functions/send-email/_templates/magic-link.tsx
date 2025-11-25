import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Complete your registration for Sampoerna University Career Center</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Sampoerna Career Connect</Heading>
        <Text style={text}>
          Thank you for signing up! Click the button below to complete your registration and access the Career Center platform.
        </Text>
        <Link
          href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
          target="_blank"
          style={button}
        >
          Complete Registration
        </Link>
        <Text style={{ ...text, marginTop: '24px', marginBottom: '14px' }}>
          Or, copy and paste this verification code:
        </Text>
        <code style={code}>{token}</code>
        <Text
          style={{
            ...text,
            color: '#6b7280',
            marginTop: '24px',
            marginBottom: '16px',
          }}
        >
          If you didn't create an account with Sampoerna Career Connect, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          Sampoerna University Career Center
          <br />
          Building futures, one opportunity at a time.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
  borderRadius: '8px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 24px',
  lineHeight: '1.3',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '16px 0',
}

const code = {
  display: 'inline-block',
  padding: '16px',
  width: '100%',
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  letterSpacing: '0.05em',
  fontFamily: 'monospace',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
}
