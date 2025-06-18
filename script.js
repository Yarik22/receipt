class ReceiptApp {
  constructor() {
    this.service = new ReceiptService();
    this.initElements();
    this.initEventListeners();
    this.render();
  }

  initElements() {
    this.elements = {
      servicesContainer: document.getElementById("services"),
      addServiceBtn: document.getElementById("addServiceBtn"),
      generateBtn: document.getElementById("generateReceiptBtn"),
      downloadBtn: document.getElementById("downloadReceiptBtn"),
      receiptContent: document.getElementById("receiptContent"),
      employeeName: document.getElementById("employeeName"),
      employeePhone: document.getElementById("employeePhone"),
      employeeAddress: document.getElementById("employeeAddress"),
    };
  }

  initEventListeners() {
    this.elements.addServiceBtn.addEventListener("click", () =>
      this.addService()
    );
    this.elements.generateBtn.addEventListener("click", () =>
      this.generateReceipt()
    );
    this.elements.downloadBtn.addEventListener("click", () =>
      this.downloadReceipt()
    );

    [
      this.elements.employeeName,
      this.elements.employeePhone,
      this.elements.employeeAddress,
    ].forEach((input) => {
      input.addEventListener("change", () => this.updateEmployeeInfo());
    });
  }

  updateEmployeeInfo() {
    this.service.updateEmployeeInfo(
      this.elements.employeeName.value,
      this.elements.employeePhone.value,
      this.elements.employeeAddress.value
    );
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
    nameInput.addEventListener("change", (e) => {
      service.name = e.target.value;
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-danger";
    removeBtn.innerHTML = "×";
    removeBtn.addEventListener("click", () => {
      this.service.removeService(service.id);
      this.renderServices();
    });

    header.append(nameInput, removeBtn);
    serviceEl.append(header);

    // Subservices
    service.subservices.forEach((subservice) => {
      const subEl = document.createElement("div");
      subEl.className = "subservice";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = subservice.name;
      nameInput.placeholder = "Назва підпослуги";
      nameInput.addEventListener("change", (e) => {
        subservice.name = e.target.value;
      });

      const priceInput = document.createElement("input");
      priceInput.type = "number";
      priceInput.value = subservice.price;
      priceInput.placeholder = "Ціна";
      priceInput.addEventListener("change", (e) => {
        subservice.price = parseFloat(e.target.value) || 0;
      });

      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-danger";
      removeBtn.innerHTML = "×";
      removeBtn.addEventListener("click", () => {
        this.service.removeSubservice(service.id, subservice.id);
        this.renderServices();
      });

      subEl.append(nameInput, priceInput, removeBtn);
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
    this.elements.receiptContent.innerHTML = "";
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
        case "service":
          el.className = "service-title";
          el.textContent = line.content;
          break;
        case "subservice":
          el.className = "subservice-line";
          el.innerHTML = `
            <span class="subservice-name">${line.name}</span>
            <span class="subservice-price">${line.price}</span>
          `;
          break;
        case "total":
          el.className = "total-line";
          el.innerHTML = `
            <span>${line.label}</span>
            <span>${line.value}</span>
          `;
          break;
        default: // employee and text
          el.className = "employee-info";
          el.textContent = line.content;
      }

      this.elements.receiptContent.append(el);
    });
  }
  downloadReceipt() {
    // First ensure the receipt is generated
    this.generateReceipt();

    // Get the original receipt element
    const receipt = document.getElementById("receipt");

    // Show loading state (optional)
    const originalButtonText = this.elements.downloadBtn.innerHTML;
    this.elements.downloadBtn.innerHTML = "Generating...";
    this.elements.downloadBtn.disabled = true;

    // Create clone with all necessary styles
    const clone = receipt.cloneNode(true);
    clone.id = "receipt-clone";

    // Apply required styles to the clone
    const cloneStyles = {
      position: "absolute",
      left: "-9999px",
      top: "0",
      width: "var(--receipt-width)",
      padding: "1rem",
      fontFamily: "Courier New, monospace",
      fontSize: "12px",
      backgroundColor: "white",
      visibility: "visible",
      opacity: "1",
    };

    Object.assign(clone.style, cloneStyles);

    // Append to body
    document.body.appendChild(clone);

    // Use setTimeout to ensure proper rendering
    setTimeout(() => {
      html2canvas(clone, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      })
        .then((canvas) => {
          // Create download link
          const link = document.createElement("a");
          link.download = "receipt.png";
          link.href = canvas.toDataURL("image/png");
          link.click();

          // Clean up
          clone.remove();

          // Restore button state
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

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => new ReceiptApp());
