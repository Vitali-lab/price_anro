import { useState } from "react";
import { generateContract } from "../docs/ContractGenerator";
import styles from './Docs.module.css'

export const ContractForm = () => {
  const [formData, setFormData] = useState({
    contractNumber: "",
    contractDate: "",
    organizationName: "",
    directorName: "",
    addressLegal: "",
    addressPost: "",
    ogrn: "",
    innKpp: "",
    account: "",
    bank: "",
    corrAccount: "",
    bik: "",
    okpo: "",
    email: "",
    phone: "",
  });

  
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("/contract-template.docx");
      const arrayBuffer = await response.arrayBuffer();
      await generateContract(arrayBuffer, formData);
    } catch (error) {
      alert("Ошибка при загрузке шаблона: " + error.message);
    }
  };

  return (
    <div className={styles.contractForm}>
      <h2>Формирование договора</h2>

      <label>Номер договора:
        <input name="contractNumber" value={formData.contractNumber} onChange={handleInput} />
      </label>
      <label>Дата договора:
        <input name="contractDate" type="date" value={formData.contractDate} onChange={handleInput} />
      </label>
      <label>Название организации:
        <input name="organizationName" value={formData.organizationName} onChange={handleInput} />
      </label>
      <label>ФИО директора:
        <input name="directorName" value={formData.directorName} onChange={handleInput} />
      </label>

      <h3>Реквизиты покупателя</h3>
      <label>Юридический адрес:
        <input name="addressLegal" value={formData.addressLegal} onChange={handleInput} />
      </label>
      <label>Почтовый адрес:
        <input name="addressPost" value={formData.addressPost} onChange={handleInput} />
      </label>
      <label>ОГРН:
        <input name="ogrn" value={formData.ogrn} onChange={handleInput} />
      </label>
      <label>ИНН / КПП:
        <input name="innKpp" value={formData.innKpp} onChange={handleInput} />
      </label>
      <label>Расчётный счёт:
        <input name="account" value={formData.account} onChange={handleInput} />
      </label>
      <label>Банк:
        <input name="bank" value={formData.bank} onChange={handleInput} />
      </label>
      <label>Корреспондентский счёт:
        <input name="corrAccount" value={formData.corrAccount} onChange={handleInput} />
      </label>
      <label>БИК:
        <input name="bik" value={formData.bik} onChange={handleInput} />
      </label>
      <label>ОКПО:
        <input name="okpo" value={formData.okpo} onChange={handleInput} />
      </label>
      <label>E-mail:
        <input name="email" value={formData.email} onChange={handleInput} />
      </label>
      <label>Телефон / Факс:
        <input name="phone" value={formData.phone} onChange={handleInput} />
      </label>

      <button onClick={handleDownload}>
        📄 Скачать договор
      </button>
    </div>
  );
};
