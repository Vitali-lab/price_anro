import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

export const generateContract = async (templateArrayBuffer, formData) => {
  try {
    const zip = new PizZip(templateArrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData({
      contract_number: formData.contractNumber,
      contract_date: formData.contractDate,
      organization_name: formData.organizationName,
      director_name: formData.directorName,
      buyer_address_legal: formData.addressLegal,
      buyer_address_post: formData.addressPost,
      buyer_ogrn: formData.ogrn,
      buyer_inn_kpp: formData.innKpp,
      buyer_account: formData.account,
      buyer_bank: formData.bank,
      buyer_corr_account: formData.corrAccount,
      buyer_bik: formData.bik,
      buyer_okpo: formData.okpo,
      buyer_email: formData.email,
      buyer_phone: formData.phone,
      buyer_footer: formData.organizationName,
      buyer_signature: formData.directorName,
    });

    try {
      doc.render();
    } catch (error) {
      console.error("Ошибка шаблона:", error);
      const e = error;
      console.log("❌ Ошибка docxtemplater:", e.message, e.name);
      if (e.properties && e.properties.errors) {
        e.properties.errors.forEach((err, i) => {
          console.log(`Ошибка ${i + 1}:`, err);
        });
      }
      throw error;
    }

    doc.render();
    const out = doc.getZip().generate({ type: "blob" });
    saveAs(out, `Договор_${formData.contractNumber || "без_номера"}.docx`);
  } catch (error) {
    console.error("Ошибка при генерации договора:", error);
  }
};
