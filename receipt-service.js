class ReceiptService {
  constructor() {
    this.services = this.getInitialServices();
    this.employee = {
      name: "Попов Андрій В'ячеславович",
      phone: "050-200-55-89",
      address: "Відсутня",
    };
  }

  getInitialServices() {
    return [
      {
        id: uuid.v4(),
        name: "Передплата за роботу",
        subservices: [
          {
            id: uuid.v4(),
            name: "Паливо",
            price: 0,
          },
        ],
      },
      {
        id: uuid.v4(),
        name: "Матеріал та розхідники",
        subservices: [
          {
            id: uuid.v4(),
            name: "Камери",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "Розподілювачі",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "РоЕ сплітери",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "Конектори",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "Натягувачі",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "Крюки",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "Хомути",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "Кріплення",
            price: 0,
          },
        ],
      },
      {
        id: uuid.v4(),
        name: "Робота",
        subservices: [
          {
            id: uuid.v4(),
            name: "Монтаж",
            price: 0,
          },
          {
            id: uuid.v4(),
            name: "Налаштування",
            price: 0,
          },
        ],
      },
    ];
  }

  addService() {
    const newService = {
      id: uuid.v4(),
      name: "Нова послуга",
      subservices: [
        {
          id: uuid.v4(),
          name: "###",
          price: 0,
        },
      ],
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
      const newSubservice = {
        id: uuid.v4(),
        name: "###",
        price: 0,
      };
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
    this.employee.address = address;
  }

  generateReceipt() {
    let total = 0;
    const receiptWidth = 38;
    let lines = [];

    // Header
    lines.push({ type: "title", content: "ФІСКАЛЬНИЙ ЧЕК" });
    lines.push({ type: "divider" });
    lines.push({ type: "id", content: "id: " + uuid.v4().split("-")[0] });
    lines.push({ type: "divider" });

    // Services
    this.services.forEach((service, serviceIndex) => {
      lines.push({
        type: "service",
        content: `${serviceIndex + 1}) ${service.name}`,
      });

      service.subservices.forEach((subservice, subIndex) => {
        const price = subservice.price || 0;
        total += price;

        lines.push({
          type: "subservice",
          name: `${serviceIndex + 1}.${subIndex + 1} ${subservice.name}`,
          price: `${price} грн`,
        });
      });
    });

    // Footer
    lines.push({ type: "divider" });
    lines.push({
      type: "total",
      label: "Загальна сума",
      value: `${total} грн`,
    });
    lines.push({ type: "divider" });

    // Employee info - just plain text
    lines.push({ type: "text", content: `Працівник: ${this.employee.name}` });
    lines.push({ type: "text", content: `Телефон: ${this.employee.phone}` });
    lines.push({ type: "text", content: `Адреса: ${this.employee.address}` });

    return lines;
  }
}
