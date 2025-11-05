// js/pages/create_event.js - Logic dành riêng cho trang tạo sự kiện

function initializeCreateEventPage() {
    const form = document.getElementById('create-event-form');
    if (!form) return;

    const successModal = document.getElementById('success-modal');
    if (successModal) {
        const viewMyEventsBtn = document.getElementById('view-my-events-btn');
        if (viewMyEventsBtn) {
            viewMyEventsBtn.addEventListener('click', () => {
                successModal.classList.remove('active');
            });
        }
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }

    const btnOpenSessionModal = document.getElementById('btn-open-session-modal');
    const sessionModal = document.getElementById('session-modal');
    const sessionForm = document.getElementById('session-form');
    const sessionPopupTitle = document.querySelector('#session-modal .popup-title');
    const sessionsListContainer = document.getElementById('sessions-list');
    const deleteSessionConfirmModal = document.getElementById('delete-session-confirm-modal');
    const btnConfirmDeleteSession = document.getElementById('btn-confirm-delete-session');
    const btnCancelDeleteSession = document.getElementById('btn-cancel-delete-session');
    
    const populateHourSelect = (selectElement) => {
        if (!selectElement) return;
        selectElement.innerHTML = '';
        for (let hour = 0; hour < 24; hour++) {
            const hourFormatted = hour.toString().padStart(2, '0');
            const option = document.createElement('option');
            option.value = hourFormatted;
            option.textContent = hourFormatted;
            if (hour === 19) option.selected = true;
            selectElement.appendChild(option);
        }
    };

    const populateMinuteSelect = (selectElement) => {
        if (!selectElement) return;
        selectElement.innerHTML = '';
        for (let minute = 0; minute < 60; minute += 1) {
            const minuteFormatted = minute.toString().padStart(2, '0');
            const option = document.createElement('option');
            option.value = minuteFormatted;
            option.textContent = minuteFormatted;
            selectElement.appendChild(option);
        }
    };

    const hourSelect = document.getElementById('org-hour-select');
    const minuteSelect = document.getElementById('org-minute-select');
    populateHourSelect(hourSelect);
    populateMinuteSelect(minuteSelect);

    const setupHybridDropdowns = () => {
        document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const panel = dropdown.querySelector('.dropdown-panel');
            if(!trigger || !panel) return;

            if (dropdown.dataset.role === 'hour') panel.value = '19';
            if (dropdown.dataset.role === 'minute') panel.value = '00';
            trigger.textContent = panel.value;

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.custom-dropdown.open').forEach(openDropdown => {
                    if (openDropdown !== dropdown) openDropdown.classList.remove('open');
                });
                dropdown.classList.toggle('open');
            });

            panel.addEventListener('change', () => {
                trigger.textContent = panel.value;
                dropdown.classList.remove('open');
            });

            panel.addEventListener('click', (e) => e.stopPropagation());
            panel.addEventListener('blur', () => dropdown.classList.remove('open'));
        });

        window.addEventListener('click', () => {
            document.querySelectorAll('.custom-dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        });
    };

    setupHybridDropdowns();

    let ticketTypes = [];
    let editingTicketIndex = null;
    let sessions = [];
    let editingSessionIndex = null;
    
    let currentStep = 1;
    const totalSteps = 4;

    const stepperItems = document.querySelectorAll('.stepper-item');
    const formSteps = document.querySelectorAll('.form-step');
    const btnNext = document.getElementById('btn-next-step');
    const btnSave = document.getElementById('btn-save');
    const btnOpenTicketModal = document.getElementById('btn-open-ticket-modal');
    const ticketTypeModal = document.getElementById('ticket-type-modal');
    const ticketTypeForm = document.getElementById('ticket-type-form');
    const ticketTypesListContainer = document.getElementById('ticket-types-list');
    const ticketPopupTitle = document.querySelector('#ticket-type-modal .popup-title');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    
    const validationModal = document.getElementById('validation-modal');
    if (validationModal) {
        validationModal.addEventListener('click', (e) => {
            if (e.target === validationModal || e.target.closest('.btn')) {
                validationModal.classList.remove('active');
            }
        });
    }

    const updateUI = () => {
        stepperItems.forEach(item => {
            const step = parseInt(item.dataset.step);
            item.classList.toggle('active', step === currentStep);
        });
        formSteps.forEach(stepContent => {
            const step = parseInt(stepContent.dataset.stepContent);
            stepContent.classList.toggle('active', step === currentStep);
        });
        btnNext.textContent = currentStep === totalSteps ? 'Hoàn tất' : 'Tiếp tục';
    };

    const validateCurrentStep = () => {
        const currentFormStep = document.querySelector(`.form-step[data-step-content="${currentStep}"]`);
        const requiredInputs = currentFormStep.querySelectorAll('[required]');
        let isValid = true;
        requiredInputs.forEach(input => {
            if (input.id === 'event-description-editor' && typeof tinymce !== 'undefined') {
                if (tinymce.get('event-description-editor').getContent({ format: 'text' }).trim() === '') {
                    isValid = false;
                    document.querySelector('.tox.tox-tinymce').style.border = '1px solid #F87171';
                } else {
                    document.querySelector('.tox.tox-tinymce').style.border = '';
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#F87171';
            } else {
                input.style.borderColor = '';
            }
        });
        return isValid;
    };

    const handleFormSubmit = () => {
        const formData = {
            eventName: document.getElementById('event-name').value,
            locationType: document.querySelector('input[name="location_type"]:checked').value,
            locationName: document.getElementById('location-name').value,
            province: document.getElementById('province').value,
            district: document.getElementById('district').value,
            ward: document.getElementById('ward').value,
            street: document.getElementById('street').value,
            category: document.getElementById('event-category').value,
            description: (typeof tinymce !== 'undefined') ? tinymce.get('event-description-editor').getContent() : '',
            organizerName: document.getElementById('organizer-name').value,
            organizerInfo: document.getElementById('organizer-info').value,
        };
        console.log("Dữ liệu đã gửi đi:", formData);
    };

    const renderTicketTypes = () => {
        if(!ticketTypesListContainer) return;
        ticketTypesListContainer.innerHTML = '';
        if (ticketTypes.length === 0) return;
        const list = document.createElement('div');
        list.className = 'created-item-list';
        ticketTypes.forEach((ticket, index) => {
            const item = document.createElement('div');
            item.className = 'created-item';
            item.style.borderColor = ticket.color;
            const priceDisplay = ticket.isFree ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price);
            item.innerHTML = `
                <div class="created-item-info">
                    <span class="ticket-name">${ticket.name}</span>
                    <span class="ticket-price">${priceDisplay}</span>
                </div>
                <div class="created-item-actions">
                    <button type="button" class="btn-edit-ticket" data-index="${index}"><img src="../../images/icon-edit.svg" alt="Edit"></button>
                    <button type="button" class="btn-delete-ticket" data-index="${index}"><img src="../../images/icon-delete.svg" alt="Delete"></button>
                </div>`;
            item.querySelector('.btn-edit-ticket').addEventListener('click', () => {
                editingTicketIndex = index;
                ticketPopupTitle.textContent = "CHỈNH SỬA LOẠI VÉ";
                document.getElementById('ticket-name').value = ticket.name;
                document.getElementById('ticket-price').value = ticket.price;
                document.getElementById('ticket-free').checked = ticket.isFree;
                document.getElementById('ticket-quantity').value = ticket.quantity;
                document.getElementById('ticket-min-order').value = ticket.minOrder;
                document.getElementById('ticket-color').value = ticket.color;
                document.getElementById('ticket-info').value = ticket.info;
                ticketTypeModal.classList.add('active');
            });
            item.querySelector('.btn-delete-ticket').addEventListener('click', () => {
                editingTicketIndex = index;
                if (deleteConfirmModal) deleteConfirmModal.classList.add('active');
            });
            list.appendChild(item);
        });
        ticketTypesListContainer.appendChild(list);
    };

    const renderSessions = () => {
        if(!sessionsListContainer) return;
        sessionsListContainer.innerHTML = '';
        if (sessions.length === 0) return;
        const list = document.createElement('div');
        list.className = 'created-item-list';
        sessions.forEach((session, index) => {
            const item = document.createElement('div');
            item.className = 'created-item';
            item.innerHTML = `
                <div class="created-item-info">
                    <span class="ticket-name">${session.name}</span>
                    <span class="ticket-price" style="color: #ccc; font-weight: 400;">${session.start} - ${session.end}</span>
                </div>
                <div class="created-item-actions">
                    <button type="button" class="btn-edit-session" data-index="${index}"><img src="../../images/icon-edit.svg" alt="Edit"></button>
                    <button type="button" class="btn-delete-session" data-index="${index}"><img src="../../images/icon-delete.svg" alt="Delete"></button>
                </div>`;
            item.querySelector('.btn-edit-session').addEventListener('click', () => {
                editingSessionIndex = index;
                sessionPopupTitle.textContent = "CHỈNH SỬA SUẤT DIỄN";
                document.getElementById('session-name').value = session.name;
                document.getElementById('session-start-date').value = session.start;
                document.getElementById('session-end-date').value = session.end;
                sessionModal.classList.add('active');
            });
            item.querySelector('.btn-delete-session').addEventListener('click', () => {
                editingSessionIndex = index;
                if(deleteSessionConfirmModal) deleteSessionConfirmModal.classList.add('active');
            });
            list.appendChild(item);
        });
        sessionsListContainer.appendChild(list);
    };

    if(btnNext) btnNext.addEventListener('click', () => {
        if (typeof tinymce !== 'undefined') tinymce.triggerSave();
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateUI();
            } else {
                handleFormSubmit();
                if (successModal) successModal.classList.add('active');
            }
        } else {
            if (validationModal) validationModal.classList.add('active');
        }
    });

    if(btnSave) btnSave.addEventListener('click', () => alert('Đã lưu bản nháp!'));

    document.querySelectorAll('.image-upload-input').forEach(input => {
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                const previewId = event.target.dataset.previewId;
                const previewElement = document.getElementById(previewId);
                reader.onload = function (e) {
                    previewElement.style.backgroundImage = `url('${e.target.result}')`;
                    previewElement.classList.add('has-image');
                }
                reader.readAsDataURL(file);
            }
        });
    });

    const seatingMapUpload = document.getElementById('seating-map-upload');
    if (seatingMapUpload) {
        const previewImg = document.getElementById('seating-map-img');
        const placeholder = document.getElementById('seating-map-placeholder');
        seatingMapUpload.addEventListener('change', function (event) {
            event.stopImmediatePropagation();
            const file = event.target.files[0];
            if (file && previewImg && placeholder) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImg.src = e.target.result;
                    previewImg.style.display = 'block';
                    placeholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const host = "http://provinces.open-api.vn/api/";
    const provinceSelect = document.getElementById("province");
    const districtSelect = document.getElementById("district");
    const wardSelect = document.getElementById("ward");
    if (provinceSelect && districtSelect && wardSelect) {
        const renderData = (data, selectElement) => {
            let placeholder = "Vui lòng chọn";
            if (selectElement.id === 'province') placeholder = "Tỉnh/Thành";
            if (selectElement.id === 'district') placeholder = "Quận/Huyện";
            if (selectElement.id === 'ward') placeholder = "Phường/Xã";
            selectElement.innerHTML = `<option value="">${placeholder}</option>`;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.code;
                option.innerText = item.name;
                selectElement.appendChild(option);
            });
        };
        fetch(host + "p/").then(res => { if (!res.ok) throw new Error("Lỗi mạng khi tải Tỉnh/Thành"); return res.json(); }).then(data => renderData(data, provinceSelect)).catch(error => { console.error("Lỗi khi tải danh sách Tỉnh/Thành:", error); provinceSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>'; });
        provinceSelect.addEventListener('change', () => {
            if (!provinceSelect.value) { districtSelect.innerHTML = '<option value="">Quận/Huyện</option>'; wardSelect.innerHTML = '<option value="">Phường/Xã</option>'; return; }
            fetch(host + "p/" + provinceSelect.value + "?depth=2").then(res => { if (!res.ok) throw new Error("Lỗi mạng khi tải Quận/Huyện"); return res.json(); }).then(data => { renderData(data.districts, districtSelect); wardSelect.innerHTML = '<option value="">Phường/Xã</option>'; }).catch(error => { console.error("Lỗi khi tải danh sách Quận/Huyện:", error); districtSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>'; });
        });
        districtSelect.addEventListener('change', () => {
            if (!districtSelect.value) { wardSelect.innerHTML = '<option value="">Phường/Xã</option>'; return; }
            fetch(host + "d/" + districtSelect.value + "?depth=2").then(res => { if (!res.ok) throw new Error("Lỗi mạng khi tải Phường/Xã"); return res.json(); }).then(data => renderData(data.wards, wardSelect)).catch(error => { console.error("Lỗi khi tải danh sách Phường/Xã:", error); wardSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>'; });
        });
    }

    if (window.initializeDatePicker) {
        window.initializeDatePicker({
            modalId: 'date-picker-modal-organizer', triggerSelector: '.date-input-organizer',
            grid1Id: 'org-calendar-grid-1', grid2Id: 'org-calendar-grid-2',
            month1Id: 'org-month-name-1', month2Id: 'org-month-name-2',
            prevBtnId: 'org-calendar-prev-month', nextBtnId: 'org-calendar-next-month',
            mode: 'single',
            onApply: ({ startDate, time, target }) => {
                if (target && startDate) {
                    const day = startDate.getDate().toString().padStart(2, '0');
                    const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = startDate.getFullYear();
                    target.value = `${day}/${month}/${year} ${time}`;
                }
            }
        });
    }

    if (btnOpenTicketModal && ticketTypeModal) {
        btnOpenTicketModal.addEventListener('click', () => {
            editingTicketIndex = null;
            ticketPopupTitle.textContent = "TẠO LOẠI VÉ MỚI";
            ticketTypeForm.reset();
            document.getElementById('ticket-color').value = "#A855F7";
            document.getElementById('ticket-min-order').value = "1";
            ticketTypeModal.classList.add('active');
        });
        ticketTypeModal.addEventListener('click', (e) => { if (e.target === ticketTypeModal) ticketTypeModal.classList.remove('active'); });
    }
    if (ticketTypeForm) {
        ticketTypeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ticketData = {
                name: document.getElementById('ticket-name').value, price: document.getElementById('ticket-price').value,
                isFree: document.getElementById('ticket-free').checked, quantity: document.getElementById('ticket-quantity').value,
                minOrder: document.getElementById('ticket-min-order').value, color: document.getElementById('ticket-color').value,
                info: document.getElementById('ticket-info').value,
            };
            if (editingTicketIndex !== null) { ticketTypes[editingTicketIndex] = ticketData; } else { ticketTypes.push(ticketData); }
            renderTicketTypes();
            ticketTypeModal.classList.remove('active');
        });
    }
    if (btnOpenSessionModal && sessionModal) {
        btnOpenSessionModal.addEventListener('click', () => {
            editingSessionIndex = null;
            sessionPopupTitle.textContent = "TẠO SUẤT DIỄN MỚI";
            sessionForm.reset();
            sessionModal.classList.add('active');
        });
        sessionModal.addEventListener('click', (e) => { if (e.target === sessionModal) sessionModal.classList.remove('active'); });
    }
    if (sessionForm) {
        sessionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sessionData = {
                name: document.getElementById('session-name').value,
                start: document.getElementById('session-start-date').value,
                end: document.getElementById('session-end-date').value,
            };
            if (editingSessionIndex !== null) { sessions[editingSessionIndex] = sessionData; } else { sessions.push(sessionData); }
            renderSessions();
            sessionModal.classList.remove('active');
        });
    }
    if (deleteSessionConfirmModal) {
        btnCancelDeleteSession.addEventListener('click', () => deleteSessionConfirmModal.classList.remove('active'));
        btnConfirmDeleteSession.addEventListener('click', () => { if (editingSessionIndex !== null) { sessions.splice(editingSessionIndex, 1); renderSessions(); } deleteSessionConfirmModal.classList.remove('active'); });
        deleteSessionConfirmModal.addEventListener('click', (e) => { if (e.target === deleteSessionConfirmModal) deleteSessionConfirmModal.classList.remove('active'); });
    }
    if (deleteConfirmModal) {
        btnCancelDelete.addEventListener('click', () => deleteConfirmModal.classList.remove('active'));
        btnConfirmDelete.addEventListener('click', () => { if (editingTicketIndex !== null) { ticketTypes.splice(editingTicketIndex, 1); renderTicketTypes(); } deleteConfirmModal.classList.remove('active'); });
        deleteConfirmModal.addEventListener('click', (e) => { if (e.target === deleteConfirmModal) deleteConfirmModal.classList.remove('active'); });
    }
    //currentStep=2;
    
    updateUI();
};