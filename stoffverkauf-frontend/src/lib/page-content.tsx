import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type PageSection = {
  id: string;
  titleDe: string;
  titleEn: string;
  contentDe: string;
  contentEn: string;
};

export type PageDef = {
  id: string;
  nameDe: string;
  nameEn: string;
  path: string;
  sections: PageSection[];
};

const defaultPages: PageDef[] = [
  {
    id: "service",
    nameDe: "Service",
    nameEn: "Service",
    path: "/service",
    sections: [
      { id: "intro", titleDe: "Unser Service", titleEn: "Our Service", contentDe: "Bei Stoffverkauf Weber steht Kundenservice an erster Stelle. Wir bieten Ihnen persönliche Beratung, Stoffmuster-Service und schnelle Lieferung.", contentEn: "At Stoffverkauf Weber, customer service comes first. We offer personal consultation, fabric sample service, and fast delivery." },
      { id: "beratung", titleDe: "Persönliche Beratung", titleEn: "Personal Consultation", contentDe: "Unsere erfahrenen Mitarbeiter beraten Sie gerne telefonisch oder per E-Mail bei der Auswahl des richtigen Stoffes für Ihr Projekt. Rufen Sie uns an unter 06171/53159 oder schreiben Sie uns.", contentEn: "Our experienced team is happy to advise you by phone or email on choosing the right fabric for your project. Call us at 06171/53159 or write to us." },
      { id: "schneiderei", titleDe: "Zuschnitt-Service", titleEn: "Cutting Service", contentDe: "Wir schneiden Ihre Stoffe präzise nach Maß. Alle Stoffe werden sorgfältig gefaltet und verpackt, um Transportschäden zu vermeiden.", contentEn: "We cut your fabrics precisely to measure. All fabrics are carefully folded and packaged to prevent transport damage." },
      { id: "garantie", titleDe: "Qualitätsgarantie", titleEn: "Quality Guarantee", contentDe: "Wir garantieren die Qualität aller unserer Stoffe. Sollten Sie einmal nicht zufrieden sein, finden wir gemeinsam eine Lösung.", contentEn: "We guarantee the quality of all our fabrics. If you are not satisfied, we will find a solution together." },
    ],
  },
  {
    id: "shipping",
    nameDe: "Versandbedingungen",
    nameEn: "Shipping Terms",
    path: "/shipping",
    sections: [
      { id: "allgemein", titleDe: "Versandinformationen", titleEn: "Shipping Information", contentDe: "Wir versenden alle Bestellungen sorgfältig verpackt per DHL innerhalb Deutschlands. Die Lieferzeit beträgt in der Regel 2-4 Werktage.", contentEn: "We ship all orders carefully packaged via DHL within Germany. Delivery usually takes 2-4 business days." },
      { id: "kosten", titleDe: "Versandkosten", titleEn: "Shipping Costs", contentDe: "Porto versichert innerhalb Deutschlands: 7,99 €\nPorto unversichert bis 2 kg: 5,90 € (auf eigenes Risiko des Kunden)\nPorto versichert Ausland: 16,00 €", contentEn: "Insured shipping within Germany: €7.99\nUninsured shipping up to 2 kg: €5.90 (at buyer's own risk)\nInsured international shipping: €16.00" },
      { id: "umtausch", titleDe: "Umtauschausschluss", titleEn: "Exchange Exclusion", contentDe: "Die Meterware ist vom Umtausch ausgeschlossen.", contentEn: "Cut fabric (sold by the meter) is excluded from exchange." },
      { id: "tracking", titleDe: "Sendungsverfolgung", titleEn: "Order Tracking", contentDe: "Nach dem Versand erhalten Sie eine E-Mail mit Ihrer DHL-Sendungsnummer, mit der Sie Ihr Paket jederzeit verfolgen können.", contentEn: "After shipping, you will receive an email with your DHL tracking number, allowing you to track your package at any time." },
    ],
  },
  {
    id: "samples",
    nameDe: "Stoffmuster",
    nameEn: "Fabric Samples",
    path: "/samples",
    sections: [
      { id: "info", titleDe: "Stoffmuster bestellen", titleEn: "Order Fabric Samples", contentDe: "Überzeugen Sie sich von der Qualität unserer Stoffe, bevor Sie kaufen. Bestellen Sie ganz einfach Stoffmuster direkt auf jeder Produktseite.", contentEn: "Convince yourself of the quality of our fabrics before you buy. Simply order fabric samples directly on each product page." },
      { id: "preise", titleDe: "Musterpreise", titleEn: "Sample Prices", contentDe: "5 Stoffmuster Ihrer Wahl: 5,00 €. Die Muster sind ca. 10x15 cm groß.", contentEn: "5 fabric samples of your choice: €5.00. Samples are approximately 10x15 cm." },
      { id: "anrechnung", titleDe: "Anrechnung auf Bestellung", titleEn: "Credit Towards Order", contentDe: "Bei anschließender Bestellung werden die 5,00 € verrechnet oder zurücküberwiesen.", contentEn: "With a subsequent order, the €5.00 will be credited or refunded." },
      { id: "hinweis", titleDe: "Hinweis", titleEn: "Note", contentDe: "Bitte beachten Sie, dass Farben auf dem Bildschirm von der tatsächlichen Farbe abweichen können. Wir empfehlen daher immer, ein Stoffmuster zu bestellen.", contentEn: "Please note that colors on screen may differ from the actual color. We therefore always recommend ordering a fabric sample." },
    ],
  },
  {
    id: "returns",
    nameDe: "Rückgabe",
    nameEn: "Returns",
    path: "/returns",
    sections: [
      { id: "policy", titleDe: "Rückgaberichtlinie", titleEn: "Return Policy", contentDe: "Ungeschnittene Stoffe können innerhalb von 14 Tagen nach Erhalt zurückgegeben werden. Die Ware muss unbenutzt, in Originalverpackung und vollständig sein.", contentEn: "Uncut fabrics can be returned within 14 days of receipt. The goods must be unused, in original packaging, and complete." },
      { id: "ausschluss", titleDe: "Ausschluss der Rückgabe", titleEn: "Return Exclusions", contentDe: "Zugeschnittene Meterware ist von der Rückgabe ausgeschlossen, da sie speziell nach Ihren Wünschen angefertigt wurde. Auch Stoffmuster sind vom Umtausch ausgeschlossen.", contentEn: "Cut fabric by the meter is excluded from returns as it was made specifically to your specifications. Fabric samples are also excluded from exchange." },
      { id: "ablauf", titleDe: "Rückgabeprozess", titleEn: "Return Process", contentDe: "Kontaktieren Sie uns per E-Mail an info@stoffverkauf-weber.de oder telefonisch unter 06171/53159. Wir senden Ihnen dann ein Rücksendeetikett zu. Die Rücksendekosten tragen wir.", contentEn: "Contact us by email at info@stoffverkauf-weber.de or by phone at 06171/53159. We will then send you a return label. We bear the return shipping costs." },
      { id: "erstattung", titleDe: "Erstattung", titleEn: "Refund", contentDe: "Nach Eingang und Prüfung der Rücksendung erstatten wir den Kaufpreis innerhalb von 5-7 Werktagen auf das ursprüngliche Zahlungsmittel.", contentEn: "After receipt and inspection of the return, we will refund the purchase price within 5-7 business days to the original payment method." },
    ],
  },
  {
    id: "faq",
    nameDe: "FAQ",
    nameEn: "FAQ",
    path: "/faq",
    sections: [
      { id: "faq-0", titleDe: "Wie bestelle ich Stoffmuster?", titleEn: "How do I order fabric samples?", contentDe: "Sie können Stoffmuster direkt auf jeder Produktseite bestellen. Klicken Sie auf 'Stoffmuster bestellen' und das Muster wird Ihrem Warenkorb hinzugefügt.", contentEn: "You can order fabric samples directly on each product page. Click 'Order Fabric Sample' and the sample will be added to your cart." },
      { id: "faq-1", titleDe: "Wie wird der Stoff geliefert?", titleEn: "How is the fabric delivered?", contentDe: "Wir versenden alle Stoffe sorgfältig gefaltet und verpackt per DHL. Ab 100 € Bestellwert ist der Versand kostenlos.", contentEn: "We ship all fabrics carefully folded and packaged via DHL. Shipping is free on orders over €100." },
      { id: "faq-2", titleDe: "Kann ich Stoffe zurückgeben?", titleEn: "Can I return fabrics?", contentDe: "Ja, ungeschnittene Stoffe können innerhalb von 14 Tagen zurückgegeben werden. Zugeschnittene Stoffe sind von der Rückgabe ausgeschlossen.", contentEn: "Yes, uncut fabrics can be returned within 14 days. Cut fabrics are excluded from returns." },
      { id: "faq-3", titleDe: "Welche Zahlungsmethoden akzeptieren Sie?", titleEn: "What payment methods do you accept?", contentDe: "Wir akzeptieren Kreditkarten (Visa, Mastercard, AMEX), PayPal, Klarna (Rechnung & Ratenkauf) und SEPA-Lastschrift.", contentEn: "We accept credit cards (Visa, Mastercard, AMEX), PayPal, Klarna (invoice & installments) and SEPA direct debit." },
      { id: "faq-4", titleDe: "Wie pflege ich Wollstoffe?", titleEn: "How do I care for wool fabrics?", contentDe: "Wollstoffe sollten idealerweise chemisch gereinigt werden. Einige können per Handwäsche bei 30°C gewaschen werden. Beachten Sie immer die spezifischen Pflegehinweise auf der Produktseite.", contentEn: "Wool fabrics should ideally be dry cleaned. Some can be hand washed at 30°C. Always follow the specific care instructions on the product page." },
      { id: "faq-5", titleDe: "Bieten Sie Mengenrabatte an?", titleEn: "Do you offer bulk discounts?", contentDe: "Ja, ab einer Bestellmenge von 10 Metern pro Stoff gewähren wir 10% Rabatt. Kontaktieren Sie uns für individuelle Angebote bei größeren Mengen.", contentEn: "Yes, we offer 10% discount on orders of 10 meters or more per fabric. Contact us for custom quotes on larger quantities." },
      { id: "faq-6", titleDe: "Wie lang ist die Lieferzeit?", titleEn: "What is the delivery time?", contentDe: "Lagernde Stoffe versenden wir innerhalb von 1-2 Werktagen. Die Lieferzeit beträgt in der Regel 2-4 Werktage innerhalb Deutschlands.", contentEn: "In-stock fabrics are shipped within 1-2 business days. Delivery typically takes 2-4 business days within Germany." },
      { id: "faq-7", titleDe: "Bieten Sie Nähkurse an?", titleEn: "Do you offer sewing courses?", contentDe: "Ja! Wir bieten regelmäßig Nähkurse für Anfänger und Fortgeschrittene in unserem Ladengeschäft an. Schauen Sie auf unserer Webseite für aktuelle Termine.", contentEn: "Yes! We regularly offer sewing courses for beginners and advanced sewers at our store. Check our website for current dates." },
    ],
  },
  {
    id: "legal",
    nameDe: "Rechtliches",
    nameEn: "Legal",
    path: "/legal",
    sections: [
      { id: "uebersicht", titleDe: "Rechtliche Informationen", titleEn: "Legal Information", contentDe: "Hier finden Sie alle rechtlichen Informationen zu Stoffverkauf Weber. Bitte beachten Sie auch unsere einzelnen Rechtsseiten für detaillierte Informationen.", contentEn: "Here you will find all legal information about Stoffverkauf Weber. Please also refer to our individual legal pages for detailed information." },
      { id: "betreiber", titleDe: "Betreiber", titleEn: "Operator", contentDe: "Stoffverkauf Weber, Inhaber: Max Weber, Musterstraße 1, 61440 Oberursel, Deutschland. Telefon: 06171/53159, E-Mail: info@stoffverkauf-weber.de", contentEn: "Stoffverkauf Weber, Owner: Max Weber, Musterstraße 1, 61440 Oberursel, Germany. Phone: 06171/53159, Email: info@stoffverkauf-weber.de" },
      { id: "ust", titleDe: "Umsatzsteuer-ID", titleEn: "VAT ID", contentDe: "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: DE123456789", contentEn: "VAT identification number according to § 27a of the German VAT Act: DE123456789" },
      { id: "streitschlichtung", titleDe: "Online-Streitbeilegung", titleEn: "Online Dispute Resolution", contentDe: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.", contentEn: "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board." },
    ],
  },
  {
    id: "agb",
    nameDe: "AGB",
    nameEn: "Terms & Conditions",
    path: "/agb",
    sections: [
      { id: "geltung", titleDe: "§ 1 Geltungsbereich", titleEn: "§ 1 Scope", contentDe: "Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen, die über unseren Online-Shop getätigt werden. Der Online-Shop wird betrieben von Stoffverkauf Weber, Musterstraße 1, 61440 Oberursel.", contentEn: "These Terms and Conditions apply to all orders placed through our online shop. The online shop is operated by Stoffverkauf Weber, Musterstraße 1, 61440 Oberursel." },
      { id: "vertrag", titleDe: "§ 2 Vertragsschluss", titleEn: "§ 2 Conclusion of Contract", contentDe: "Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung (invitatio ad offerendum) dar. Durch Anklicken des Buttons „Zahlungspflichtig bestellen\" geben Sie eine verbindliche Bestellung der im Warenkorb enthaltenen Waren ab.", contentEn: "The display of products in the online shop does not constitute a legally binding offer, but an invitation to order (invitatio ad offerendum). By clicking the 'Place binding order' button, you place a binding order for the goods in the shopping cart." },
      { id: "preise", titleDe: "§ 3 Preise und Versandkosten", titleEn: "§ 3 Prices and Shipping Costs", contentDe: "Alle angegebenen Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer (19% MwSt.). Zusätzlich fallen Versandkosten an, die vor Abschluss der Bestellung angezeigt werden. Ab einem Bestellwert von 100 € ist der Versand innerhalb Deutschlands kostenlos.", contentEn: "All stated prices are final prices and include the statutory value added tax (19% VAT). Additional shipping costs apply, which are displayed before completing the order. Shipping within Germany is free for orders over €100." },
      { id: "lieferung", titleDe: "§ 4 Lieferung", titleEn: "§ 4 Delivery", contentDe: "Die Lieferung erfolgt innerhalb Deutschlands. Die Lieferzeit beträgt 2-5 Werktage, sofern beim jeweiligen Artikel nicht anders angegeben. Stoffe werden als Meterware geschnitten und sind vom Umtausch ausgeschlossen, sofern sie fehlerfrei sind.", contentEn: "Delivery is within Germany. The delivery time is 2-5 business days, unless otherwise stated for the respective item. Fabrics are cut to length and are excluded from exchange, provided they are free of defects." },
      { id: "zahlung", titleDe: "§ 5 Zahlung", titleEn: "§ 5 Payment", contentDe: "Wir akzeptieren folgende Zahlungsmethoden: Kreditkarte (Visa, Mastercard, AMEX), PayPal, Klarna (Rechnung/Ratenkauf), SEPA-Lastschrift.", contentEn: "We accept the following payment methods: Credit card (Visa, Mastercard, AMEX), PayPal, Klarna (invoice/installments), SEPA direct debit." },
      { id: "widerruf", titleDe: "§ 6 Widerrufsrecht", titleEn: "§ 6 Right of Withdrawal", contentDe: "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat. Hinweis: Das Widerrufsrecht besteht nicht bei Waren, die nach Kundenspezifikation angefertigt werden (z.B. zugeschnittene Meterware).", contentEn: "You have the right to withdraw from this contract within fourteen days without giving any reason. The withdrawal period is fourteen days from the day on which you or a third party named by you, who is not the carrier, has taken possession of the goods. Note: The right of withdrawal does not apply to goods made to customer specifications (e.g. cut fabric by the meter)." },
      { id: "gewaehr", titleDe: "§ 7 Gewährleistung", titleEn: "§ 7 Warranty", contentDe: "Es gelten die gesetzlichen Gewährleistungsrechte. Die Gewährleistungsfrist beträgt 2 Jahre ab Lieferung.", contentEn: "Statutory warranty rights apply. The warranty period is 2 years from delivery." },
      { id: "streit", titleDe: "§ 8 Streitschlichtung", titleEn: "§ 8 Dispute Resolution", contentDe: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.", contentEn: "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr/. We are not obligated and not willing to participate in dispute resolution proceedings before a consumer arbitration board." },
      { id: "schluss", titleDe: "§ 9 Schlussbestimmungen", titleEn: "§ 9 Final Provisions", contentDe: "Es gilt das Recht der Bundesrepublik Deutschland. Die Anwendung des UN-Kaufrechts ist ausgeschlossen. Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, so wird hierdurch die Gültigkeit der übrigen Bestimmungen nicht berührt.", contentEn: "The law of the Federal Republic of Germany applies. The application of the UN Convention on Contracts for the International Sale of Goods is excluded. Should individual provisions of these terms and conditions be or become invalid, the validity of the remaining provisions shall not be affected." },
    ],
  },
  {
    id: "impressum",
    nameDe: "Impressum",
    nameEn: "Imprint",
    path: "/impressum",
    sections: [
      { id: "angaben", titleDe: "Angaben gemäß § 5 TMG", titleEn: "Information according to § 5 TMG", contentDe: "Stoffverkauf Weber\nInhaber: Max Weber\nMusterstraße 1\n61440 Oberursel\nDeutschland", contentEn: "Stoffverkauf Weber\nOwner: Max Weber\nMusterstraße 1\n61440 Oberursel\nGermany" },
      { id: "kontakt", titleDe: "Kontakt", titleEn: "Contact", contentDe: "Telefon: 06171/53159\nE-Mail: info@stoffverkauf-weber.de\nWebseite: www.stoffverkauf-weber.de", contentEn: "Phone: 06171/53159\nEmail: info@stoffverkauf-weber.de\nWebsite: www.stoffverkauf-weber.de" },
      { id: "ust", titleDe: "Umsatzsteuer-ID", titleEn: "VAT ID", contentDe: "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:\nDE123456789", contentEn: "VAT identification number according to § 27a of the German VAT Act:\nDE123456789" },
      { id: "handelsregister", titleDe: "Handelsregister", titleEn: "Commercial Register", contentDe: "Registergericht: Amtsgericht Bad Homburg\nRegisternummer: HRA 12345", contentEn: "Registration court: Amtsgericht Bad Homburg\nRegistration number: HRA 12345" },
      { id: "verantwortlich", titleDe: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV", titleEn: "Responsible for content according to § 55 para. 2 RStV", contentDe: "Max Weber\nMusterstraße 1\n61440 Oberursel", contentEn: "Max Weber\nMusterstraße 1\n61440 Oberursel" },
      { id: "streitschlichtung", titleDe: "EU-Streitschlichtung", titleEn: "EU Dispute Resolution", contentDe: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:\nhttps://ec.europa.eu/consumers/odr/\n\nWir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.", contentEn: "The European Commission provides a platform for online dispute resolution (ODR):\nhttps://ec.europa.eu/consumers/odr/\n\nWe are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board." },
      { id: "haftung-inhalte", titleDe: "Haftung für Inhalte", titleEn: "Liability for Content", contentDe: "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen.", contentEn: "As a service provider, we are responsible for our own content on these pages in accordance with § 7 para. 1 TMG. According to §§ 8 to 10 TMG, however, we are not obligated to monitor transmitted or stored third-party information." },
      { id: "haftung-links", titleDe: "Haftung für Links", titleEn: "Liability for Links", contentDe: "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.", contentEn: "Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this third-party content." },
      { id: "urheberrecht", titleDe: "Urheberrecht", titleEn: "Copyright", contentDe: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.", contentEn: "The content and works on these pages created by the site operators are subject to German copyright law. Duplication, processing, distribution, and any form of commercialization beyond the limits of copyright law require the written consent of the respective author or creator." },
    ],
  },
  {
    id: "datenschutz",
    nameDe: "Datenschutz",
    nameEn: "Privacy Policy",
    path: "/datenschutz",
    sections: [
      { id: "ueberblick", titleDe: "1. Datenschutz auf einen Blick", titleEn: "1. Privacy at a Glance", contentDe: "Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.", contentEn: "The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to personally identify you." },
      { id: "verantwortlich", titleDe: "2. Verantwortliche Stelle", titleEn: "2. Responsible Party", contentDe: "Stoffverkauf Weber\nInhaber: Max Weber\nMusterstraße 1\n61440 Oberursel\nE-Mail: info@stoffverkauf-weber.de\nTelefon: 06171/53159", contentEn: "Stoffverkauf Weber\nOwner: Max Weber\nMusterstraße 1\n61440 Oberursel\nEmail: info@stoffverkauf-weber.de\nPhone: 06171/53159" },
      { id: "cookies", titleDe: "3. Datenerfassung auf dieser Website", titleEn: "3. Data Collection on This Website", contentDe: "Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden.", contentEn: "Our website uses cookies. These are small text files that your web browser stores on your device. Cookies help us make our offering more user-friendly, effective, and secure. You can configure your browser to inform you about the use of cookies." },
      { id: "bestellung", titleDe: "4. Bestellvorgang / Vertragsschluss", titleEn: "4. Order Process / Contract Conclusion", contentDe: "Im Rahmen des Bestellvorgangs erheben wir personenbezogene Daten (Name, Adresse, E-Mail, Telefonnummer, Zahlungsdaten), soweit dies für die Begründung, inhaltliche Ausgestaltung oder Änderung des Vertragsverhältnisses erforderlich ist. Rechtsgrundlage hierfür ist Art. 6 Abs. 1 S. 1 lit. b DSGVO.", contentEn: "During the ordering process, we collect personal data (name, address, email, phone number, payment data) insofar as this is necessary for establishing, shaping, or amending the contractual relationship. The legal basis for this is Art. 6 para. 1 sentence 1 lit. b GDPR." },
      { id: "rechte", titleDe: "5. Ihre Rechte", titleEn: "5. Your Rights", contentDe: "Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten.", contentEn: "You have the right at any time to free information about your stored personal data, its origin and recipients, and the purpose of data processing, as well as a right to correction, blocking, or deletion of this data." },
      { id: "ssl", titleDe: "6. SSL-Verschlüsselung", titleEn: "6. SSL Encryption", contentDe: "Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-Verschlüsselung.", contentEn: "This site uses SSL encryption for security reasons and to protect the transmission of confidential content." },
      { id: "newsletter", titleDe: "7. Newsletter", titleEn: "7. Newsletter", contentDe: "Wenn Sie den auf der Website angebotenen Newsletter beziehen möchten, benötigen wir von Ihnen eine E-Mail-Adresse. Die Anmeldung erfolgt im sogenannten Double-Opt-in-Verfahren. Sie können den Newsletter jederzeit abbestellen.", contentEn: "If you wish to receive the newsletter offered on the website, we require an email address from you. Registration takes place using the so-called double opt-in procedure. You can unsubscribe from the newsletter at any time." },
    ],
  },
  {
    id: "widerruf",
    nameDe: "Widerrufsbelehrung",
    nameEn: "Cancellation Policy",
    path: "/widerruf",
    sections: [
      { id: "recht", titleDe: "Widerrufsrecht", titleEn: "Right of Withdrawal", contentDe: "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat. Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung informieren.", contentEn: "You have the right to withdraw from this contract within fourteen days without giving any reason. The withdrawal period is fourteen days from the day on which you or a third party named by you, who is not the carrier, has taken possession of the last goods. To exercise your right of withdrawal, you must inform us by means of a clear declaration." },
      { id: "folgen", titleDe: "Folgen des Widerrufs", titleEn: "Consequences of Withdrawal", contentDe: "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.", contentEn: "If you withdraw from this contract, we must repay all payments we have received from you, including delivery costs, without delay and at latest within fourteen days from the day on which we received your withdrawal notice." },
      { id: "ausschluss", titleDe: "Ausschluss des Widerrufsrechts", titleEn: "Exclusion of Right of Withdrawal", contentDe: "Das Widerrufsrecht erlischt bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist. Dies betrifft insbesondere zugeschnittene Meterware.", contentEn: "The right of withdrawal expires for contracts for the delivery of goods that are not prefabricated and for the production of which an individual selection or determination by the consumer is decisive. This applies in particular to cut fabric by the meter." },
      { id: "formular", titleDe: "Muster-Widerrufsformular", titleEn: "Model Withdrawal Form", contentDe: "An: Stoffverkauf Weber, Musterstraße 1, 61440 Oberursel, E-Mail: info@stoffverkauf-weber.de\n\nHiermit widerrufe(n) ich/wir den abgeschlossenen Vertrag über den Kauf der folgenden Waren:\n— Bestellt am / erhalten am: ___\n— Name: ___\n— Anschrift: ___\n— Unterschrift (nur bei Papier): ___\n— Datum: ___", contentEn: "To: Stoffverkauf Weber, Musterstraße 1, 61440 Oberursel, Email: info@stoffverkauf-weber.de\n\nI/We hereby revoke the contract concluded for the purchase of the following goods:\n— Ordered on / received on: ___\n— Name: ___\n— Address: ___\n— Signature (only for paper): ___\n— Date: ___" },
    ],
  },
];

const STORAGE_KEY = "weber_page_content";

function loadContent(): PageDef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PageDef[];
      // Merge: keep stored overrides but add any new default pages/sections
      const merged = defaultPages.map((dp) => {
        const sp = parsed.find((p) => p.id === dp.id);
        if (!sp) return dp;
        return { ...dp, sections: dp.sections.map((ds) => {
          const ss = sp.sections.find((s) => s.id === ds.id);
          return ss || ds;
        })};
      });
      return merged;
    }
  } catch {}
  return defaultPages;
}

function saveContent(pages: PageDef[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
}

type Ctx = {
  pages: PageDef[];
  getPage: (id: string) => PageDef | undefined;
  updateSection: (pageId: string, sectionId: string, data: Partial<PageSection>) => void;
  addSection: (pageId: string, section: PageSection) => void;
  removeSection: (pageId: string, sectionId: string) => void;
  resetPage: (pageId: string) => void;
};

const PageContentContext = createContext<Ctx | null>(null);

export const PageContentProvider = ({ children }: { children: ReactNode }) => {
  const [pages, setPages] = useState<PageDef[]>(loadContent);

  useEffect(() => { saveContent(pages); }, [pages]);

  const getPage = (id: string) => pages.find((p) => p.id === id);

  const updateSection = (pageId: string, sectionId: string, data: Partial<PageSection>) => {
    setPages((prev) => prev.map((p) => p.id !== pageId ? p : {
      ...p,
      sections: p.sections.map((s) => s.id !== sectionId ? s : { ...s, ...data }),
    }));
  };

  const addSection = (pageId: string, section: PageSection) => {
    setPages((prev) => prev.map((p) => p.id !== pageId ? p : { ...p, sections: [...p.sections, section] }));
  };

  const removeSection = (pageId: string, sectionId: string) => {
    setPages((prev) => prev.map((p) => p.id !== pageId ? p : { ...p, sections: p.sections.filter((s) => s.id !== sectionId) }));
  };

  const resetPage = (pageId: string) => {
    const def = defaultPages.find((p) => p.id === pageId);
    if (def) setPages((prev) => prev.map((p) => p.id !== pageId ? p : def));
  };

  return (
    <PageContentContext.Provider value={{ pages, getPage, updateSection, addSection, removeSection, resetPage }}>
      {children}
    </PageContentContext.Provider>
  );
};

export const usePageContent = (pageId: string) => {
  const ctx = useContext(PageContentContext);
  if (!ctx) throw new Error("usePageContent must be used within PageContentProvider");
  const page = ctx.getPage(pageId);
  return { page, sections: page?.sections || [], ...ctx };
};

export const useAllPages = () => {
  const ctx = useContext(PageContentContext);
  if (!ctx) throw new Error("useAllPages must be used within PageContentProvider");
  return ctx;
};
