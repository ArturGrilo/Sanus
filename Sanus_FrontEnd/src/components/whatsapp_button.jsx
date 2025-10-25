import { WhatsappLogoIcon } from "@phosphor-icons/react";
import "../styles/whatsapp_button.css";

export default function WhatsappButton() {
  const phoneNumber = "351912345678"; // substitui pelo nº da clínica (com código do país)
  const message = "Olá, gostaria de mais informações."; // mensagem inicial

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappLink}
      className="whatsapp-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      <WhatsappLogoIcon size={32} />
    </a>
  );
}