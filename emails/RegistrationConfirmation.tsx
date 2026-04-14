import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface RegistrationConfirmationProps {
  username: string;
  systemReference: string;
  registrationAmount: number;
  transactionReference: string;
  baseUrl?: string;
}

export const RegistrationConfirmation = ({
  username,
  systemReference,
  registrationAmount,
  transactionReference,
  baseUrl = "https://naosa.org",
}: RegistrationConfirmationProps) => {
  const previewText = `Thank you for registering with NAOSA! Your registration is pending approval.`;

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
          <Heading style={h1}>Registration Received!</Heading>
          <Text style={paragraph}>
            Hello <strong>{username}</strong>,
          </Text>
          <Text style={paragraph}>
            Thank you for registering with the Nasir Ahmadiyya Old Students
            Association (NAOSA). Your registration has been received and is
            pending review by our administrators.
          </Text>

          <Section style={infoSection}>
            <Row>
              <Column style={infoColumn}>
                <Text style={infoLabel}>System Reference:</Text>
                <Text style={infoValue}>{systemReference}</Text>
              </Column>
              <Column style={infoColumn}>
                <Text style={infoLabel}>Amount Paid:</Text>
                <Text style={infoValue}>
                  {registrationAmount.toLocaleString()} SLE
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={infoLabel}>Transaction Reference:</Text>
                <Text style={infoValue}>{transactionReference}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={paragraph}>
            You will receive another email once your registration has been
            reviewed and approved.
          </Text>

          {/* <Section style={buttonSection}>
            <Button
              style={button}
              href={`${baseUrl}/status?ref=${systemReference}`}
            >
              Check Registration Status
            </Button>
          </Section> */}

          <Hr style={hr} />

          <Text style={footer}>
            This message was intended for {username}. If you did not submit this
            registration, please ignore this email or contact us at{" "}
            <Link href="mailto:NAOSAkenema@gmail.com" style={link}>
              NAOSAkenema@gmail.com
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RegistrationConfirmation;

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

const infoSection = {
  backgroundColor: "#f8f8f8",
  borderRadius: "5px",
  padding: "16px",
  margin: "16px 0",
};

const infoColumn = {
  width: "50%",
  verticalAlign: "top" as const,
};

const infoLabel = {
  fontSize: "12px",
  color: "#666666",
  marginBottom: "4px",
};

const infoValue = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#000",
  marginTop: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#800e13",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "12px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 20px",
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
