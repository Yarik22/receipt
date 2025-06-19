class ReceiptApp {
  constructor() {
    this.service = new ReceiptService();
    this.initElements();
    this.initEventListeners();
    this.render();
    this.setupAutoUpdate();
  }

  initElements() {
    this.elements = {
      servicesContainer: document.getElementById("services"),
      addServiceBtn: document.getElementById("addServiceBtn"),
      downloadBtn: document.getElementById("downloadReceiptBtn"),
      receiptContent: document.getElementById("receiptContent"),
      employeeName: document.getElementById("employeeName"),
      employeePhone: document.getElementById("employeePhone"),
      customerName: document.getElementById("customerName"),
      customerPhone: document.getElementById("customerPhone"),
      customerAddress: document.getElementById("customerAddress"),
      prepaymentName: document.getElementById("prepaymentName"),
      prepaymentPrice: document.getElementById("prepaymentPrice"),
    };
  }

  initEventListeners() {
    this.elements.addServiceBtn.addEventListener("click", () =>
      this.addService()
    );
    this.elements.downloadBtn.addEventListener("click", () =>
      this.downloadReceipt()
    );

    // Use 'input' event for real-time updates
    this.elements.employeeName.addEventListener("input", () =>
      this.updateEmployeeInfo()
    );
    this.elements.employeePhone.addEventListener("input", () =>
      this.updateEmployeeInfo()
    );
    this.elements.customerName.addEventListener("input", () =>
      this.updateCustomerInfo()
    );
    this.elements.customerPhone.addEventListener("input", () =>
      this.updateCustomerInfo()
    );
    this.elements.customerAddress.addEventListener("input", () =>
      this.updateCustomerInfo()
    );
    this.elements.prepaymentName.addEventListener("input", () =>
      this.updatePrepayment()
    );
    this.elements.prepaymentPrice.addEventListener("input", () =>
      this.updatePrepayment()
    );
  }

  setupAutoUpdate() {
    this.elements.servicesContainer.addEventListener("input", () => {
      this.generateReceipt();
    });
  }

  updateEmployeeInfo() {
    this.service.updateEmployeeInfo(
      this.elements.employeeName.value,
      this.elements.employeePhone.value
    );
    this.generateReceipt();
  }

  updateCustomerInfo() {
    this.service.updateCustomerInfo(
      this.elements.customerName.value,
      this.elements.customerPhone.value,
      this.elements.customerAddress.value
    );
    this.generateReceipt();
  }

  updatePrepayment() {
    this.service.updatePrepayment(
      this.elements.prepaymentName.value,
      this.elements.prepaymentPrice.value
    );
    this.generateReceipt();
  }

  render() {
    this.renderServices();
    this.generateReceipt();
  }

  renderServices() {
    this.elements.servicesContainer.innerHTML = "";
    this.service.services.forEach((service) => {
      this.elements.servicesContainer.appendChild(
        this.createServiceElement(service)
      );
    });
  }

  createServiceElement(service) {
    const serviceEl = document.createElement("div");
    serviceEl.className = "service-card";
    serviceEl.dataset.id = service.id;

    // Service header
    const header = document.createElement("div");
    header.className = "service-header";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = service.name;
    nameInput.placeholder = "Назва послуги";
    nameInput.addEventListener("input", (e) => {
      service.name = e.target.value;
      this.generateReceipt();
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger service-delete-btn";
    removeBtn.innerHTML = "×";
    removeBtn.title = "Видалити послугу";
    removeBtn.addEventListener("click", () => {
      this.service.removeService(service.id);
      this.generateReceipt();
      this.renderServices();
    });

    header.append(nameInput, removeBtn);
    serviceEl.append(header);

    // Subservices
    service.subservices.forEach((subservice) => {
      const subEl = document.createElement("div");
      subEl.className = "subservice";

      // Input container
      const inputsContainer = document.createElement("div");
      inputsContainer.className = "subservice-inputs";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = subservice.name;
      nameInput.placeholder = "Назва підпослуги";
      nameInput.addEventListener("input", (e) => {
        subservice.name = e.target.value;
        this.generateReceipt();
      });

      const priceInput = document.createElement("input");
      priceInput.type = "number";
      priceInput.value = subservice.price;
      priceInput.placeholder = "Ціна";
      priceInput.addEventListener("input", (e) => {
        subservice.price = parseFloat(e.target.value) || 0;
        this.generateReceipt();
      });

      inputsContainer.append(nameInput, priceInput);

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-danger subservice-delete-btn";
      removeBtn.innerHTML = "×";
      removeBtn.title = "Видалити підпослугу";
      removeBtn.addEventListener("click", () => {
        this.service.removeSubservice(service.id, subservice.id);
        this.generateReceipt();
        this.renderServices();
      });

      subEl.append(inputsContainer, removeBtn);
      serviceEl.append(subEl);
    });

    // Add subservice button
    const addSubBtn = document.createElement("button");
    addSubBtn.className = "btn";
    addSubBtn.innerHTML = "+ Додати підпослугу";
    addSubBtn.addEventListener("click", () => {
      this.service.addSubservice(service.id);
      this.renderServices();
    });
    serviceEl.append(addSubBtn);

    return serviceEl;
  }

  addService() {
    this.service.addService();
    this.renderServices();
  }

  generateReceipt() {
    if (!this.elements.receiptContent) return;

    const fragment = document.createDocumentFragment();
    const lines = this.service.generateReceipt();

    lines.forEach((line) => {
      const el = document.createElement("div");

      switch (line.type) {
        case "divider":
          el.className = "receipt-divider";
          break;
        case "title":
          el.className = "receipt-title";
          el.textContent = line.content;
          break;
        case "id":
          el.className = "receipt-id";
          el.textContent = line.content;
          break;
        case "prepayment":
          el.className = "prepayment-line";
          el.innerHTML = `
            <div class="prepayment-container">
              <span>${line.name}</span>
              <span>${line.price} грн</span>
            </div>
          `;
          break;
        case "service":
          el.className = "service-title";
          el.textContent = line.content;
          break;
        case "subservice":
          el.className = "subservice-line";
          const displayName = line.name.replace(/^\d+\.\d+\s/, "");
          el.innerHTML = `
            <div class="subservice-container">
              <div class="subservice-name-container">
                <span class="subservice-name">${line.number} ${displayName}</span>
              </div>
              <div class="subservice-price-container">
                <span class="subservice-price">${line.price}</span>
              </div>
            </div>
          `;
          break;
        case "total":
          el.className = "total-line";
          el.innerHTML = `
            <span>${line.label}</span>
            <span>${line.value}</span>
          `;
          break;
        default:
          el.className = "employee-info";
          el.innerHTML = line.content;
      }

      fragment.appendChild(el);
    });

    this.elements.receiptContent.innerHTML = "";
    this.elements.receiptContent.appendChild(fragment);
  }

  downloadReceipt() {
    this.generateReceipt();
    const receipt = document.getElementById("receipt");
    const originalButtonText = this.elements.downloadBtn.innerHTML;
    this.elements.downloadBtn.innerHTML = "Generating...";
    this.elements.downloadBtn.disabled = true;

    const clone = receipt.cloneNode(true);
    clone.id = "receipt-clone";

    const cloneStyles = {
      position: "absolute",
      left: "-9999px",
      top: "0",
      width: "var(--receipt-width)",
      backgroundColor: "white",
      visibility: "visible",
      opacity: "1",
    };

    Object.assign(clone.style, cloneStyles);
    document.body.appendChild(clone);

    setTimeout(() => {
      html2canvas(clone, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = "receipt.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
          clone.remove();
          this.elements.downloadBtn.innerHTML = originalButtonText;
          this.elements.downloadBtn.disabled = false;
        })
        .catch((error) => {
          console.error("Error generating receipt:", error);
          clone.remove();
          this.elements.downloadBtn.innerHTML = originalButtonText;
          this.elements.downloadBtn.disabled = false;
        });
    }, 200);
  }
}
