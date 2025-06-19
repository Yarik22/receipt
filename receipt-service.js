class ReceiptService {
  constructor() {
    this.services = this.getInitialServices();
    this.employee = {
      name: "Попов Андрій В'ячеславович",
      phone: "050-200-55-89",
    };
    this.customer = {
      name: "Відсутній",
      phone: "Відсутній",
      address: "Відсутня",
    };
    this.prepayment = {
      name: "Передплата",
      price: "",
      enabled: true,
    };
  }

  getInitialServices() {
    return [
      {
        id: uuid.v4(),
        name: "Матеріал та розхідники",
        subservices: [
          { id: uuid.v4(), name: "Камери", price: "" },
          { id: uuid.v4(), name: "Розподільчі коробки", price: "" },
          { id: uuid.v4(), name: "РоЕ сплітери", price: "" },
          { id: uuid.v4(), name: "Конектори", price: "" },
          { id: uuid.v4(), name: "Натягувачі", price: "" },
          { id: uuid.v4(), name: "Крюки", price: "" },
          { id: uuid.v4(), name: "Хомути", price: "" },
          { id: uuid.v4(), name: "Кріплення", price: "" },
        ],
      },
      {
        id: uuid.v4(),
        name: "Робота",
        subservices: [
          { id: uuid.v4(), name: "Монтаж", price: "" },
          { id: uuid.v4(), name: "Налаштування", price: "" },
        ],
      },
    ];
  }

  updatePrepayment(name, price) {
    this.prepayment.name = name;
    this.prepayment.price = price || 0;
  }

  addService() {
    const newService = {
      id: uuid.v4(),
      name: "Додаткові послуги",
      subservices: [{ id: uuid.v4(), name: "", price: "" }],
    };
    this.services.push(newService);
    return newService;
  }

  removeService(serviceId) {
    this.services = this.services.filter((service) => service.id !== serviceId);
  }

  addSubservice(serviceId) {
    const service = this.services.find((s) => s.id === serviceId);
    if (service) {
      const newSubservice = { id: uuid.v4(), name: "", price: "" };
      service.subservices.push(newSubservice);
      return newSubservice;
    }
    return null;
  }

  removeSubservice(serviceId, subserviceId) {
    const service = this.services.find((s) => s.id === serviceId);
    if (service) {
      service.subservices = service.subservices.filter(
        (sub) => sub.id !== subserviceId
      );
    }
  }

  updateEmployeeInfo(name, phone, address) {
    this.employee.name = name;
    this.employee.phone = phone;
    this.employee.address = address || "";
  }

  updateCustomerInfo(name, phone, address) {
    this.customer.name = name;
    this.customer.phone = phone;
    this.customer.address = address;
  }

  generateReceipt() {
    let total = 0;
    let lines = [];

    // Header
    lines.push({ type: "title", content: "ЧЕК" });
    lines.push({ type: "divider" });
    lines.push({ type: "id", content: "id: " + uuid.v4().split("-")[0] });
    lines.push({ type: "divider" });

    // Prepayment (always shown)
    lines.push({
      type: "prepayment",
      name: this.prepayment.name,
      price: this.prepayment.price || 0,
    });
    lines.push({ type: "divider" });

    // Services
    this.services.forEach((service, serviceIndex) => {
      let visibleSubIndex = 0;

      lines.push({
        type: "service",
        content: `${serviceIndex + 1}) ${service.name}`,
      });

      service.subservices.forEach((subservice, subIndex) => {
        const price = subservice.price || 0;
        total += price;

        if (price !== 0) {
          visibleSubIndex++;
          lines.push({
            type: "subservice",
            name: `${serviceIndex + 1}.${visibleSubIndex} ${subservice.name}`,
            price: `${price} грн`,
            number: `${serviceIndex + 1}.${visibleSubIndex}`,
          });
        }
      });
    });

    // Calculate total with prepayment deduction
    const finalTotal = total + this.prepayment.price;

    // Footer
    lines.push({ type: "divider" });
    lines.push({
      type: "total",
      label: "Загальна сума",
      value: `${finalTotal || 0} грн`,
    });
    lines.push({ type: "divider" });

    // Employee info
    lines.push({ type: "text", content: `Виконавець: ${this.employee.name}` });
    lines.push({
      type: "text",
      content: `Телефон виконавця:<br>${this.employee.phone}`,
    });

    // Customer info
    if (this.customer.name)
      lines.push({ type: "text", content: `Замовник: ${this.customer.name}` });
    if (this.customer.phone)
      lines.push({
        type: "text",
        content: `Телефон замовника:<br>${this.customer.phone}`,
      });
    if (this.customer.address)
      lines.push({
        type: "text",
        content: `Адреса замовника:<br>${this.customer.address}`,
      });

    return lines;
  }
}
