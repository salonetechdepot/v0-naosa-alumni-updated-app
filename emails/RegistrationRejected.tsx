import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface RegistrationRejectedProps {
  username: string;
  systemReference: string;
  reason?: string;
  baseUrl?: string;
}

export const RegistrationRejected = ({
  username,
  systemReference,
  reason = "incomplete information or payment verification issues",
  baseUrl = "https://naosa.org",
}: RegistrationRejectedProps) => {
  const previewText = `Update on your NAOSA registration application`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="80"
              height="80"
              alt="NAOSA Logo"
              style={logo}
            />
          </Section>
          <Heading style={h1}>Registration Status Update</Heading>
          <Text style={paragraph}>
            Dear <strong>{username}</strong>,
          </Text>
          <Text style={paragraph}>
            We regret to inform you that your registration with the Nasir
            Ahmadiyya Old Students Association (NAOSA) could not be approved at
            this time.
          </Text>

          <Section style={errorSection}>
            <Text style={errorText}>
              This may be due to: <strong>{reason}</strong>
            </Text>
          </Section>

          <Text style={paragraph}>
            Your System Reference: <strong>{systemReference}</strong>
          </Text>

          <Text style={paragraph}>
            If you believe this is an error or would like to appeal this
            decision, please contact us with your system reference number for
            assistance.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Please contact us at{" "}
            <Link href="mailto:NAOSAkenema@gmail.com" style={link}>
              NAOSAkenema@gmail.com
            </Link>{" "}
            for any questions regarding this decision.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RegistrationRejected;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: "0 auto",
  padding: "20px 0",
};

const container = {
  border: "1px solid #eaeaea",
  borderRadius: "5px",
  margin: "40px auto",
  padding: "20px",
  maxWidth: "465px",
};

const logoSection = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "normal",
  textAlign: "center" as const,
  margin: "30px 0",
};

const paragraph = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
};

const errorSection = {
  backgroundColor: "#fef2f2",
  borderRadius: "5px",
  border: "1px solid #fecaca",
  padding: "16px",
  margin: "16px 0",
};

const errorText = {
  fontSize: "14px",
  color: "#000",
  margin: "0",
};

const hr = {
  borderColor: "#eaeaea",
  margin: "26px 0",
};

const footer = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "24px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};
