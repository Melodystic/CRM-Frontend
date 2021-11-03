(() => {
  const searchInput = document.querySelector('.js-header-search');
  const changeClient = document.querySelectorAll('.js-change-client');
  const deleteClient = document.querySelectorAll('.js-delete-client');
  const addClientBtn = document.querySelector('.js-add-client');
  const modalAddClient = document.querySelector('.js-modal-add-client');
  const modalFormAdd = document.querySelector('.js-form-add');
  const modalFormChange = document.querySelector('.js-form-change');
  const modalFormDelete = document.querySelector('.js-form-delete');
  const body = document.querySelector('body');
  const table = document.querySelector('.js-table');
  const formChangeSubtitleWrapper = document.querySelector('.js-subtitle_wrapper');
  const modalChangeData = document.querySelector('.js-modal-change-data');
  const inputs = document.querySelectorAll('input');
  const modalCloseBtn = document.querySelectorAll('.js-close-modal');
  const modalDeleteWrapper = document.querySelector('.js-modal-delete-client');
  const contactsLinksWrap = document.querySelectorAll('.js-contacts-wrapper');

  createClientList();

  function interpretateDate(date) {
    const dateObj = {};
    date = date.split('T');
    const dateAt = date[0].split('-');
    [dateAt[2], dateAt[0]] = [dateAt[0], dateAt[2]];
    dateObj.date = dateAt.join('.');
    const timeAt = date[1].split(':');
    dateObj.time = timeAt[0] + ':' + timeAt[1];
    return dateObj;
  }

  async function createClientList() {
    const response = await getClients();
    const people = response.map(item => {
      return item;
    })
    people.forEach((item) => {
      const dateCreate = interpretateDate(item.createdAt);
      const dateChange = interpretateDate(item.updatedAt);
      const wrapLinks = document.createElement('div');
      wrapLinks.className = 'contacts-wrapper js-contacts-wrapper';
      const links = createLinkContacts(item.contacts, wrapLinks);
      console.log(links);
      // Проблема тут :(

      const client = `
      <tr class="table__item js-item-row">
        <td class="table__item-id">${item.id}</td>
        <td class="table__item-fio">${item.lastName + ' ' + item.name + ' ' + item.surname}</td>
        <td class="table__item-date">${dateCreate.date} <span class="table__item-time">${dateCreate.time}</span></td>
        <td class="table__item-date">${dateChange.date} <span class="table__item-time">${dateChange.time}</span></td>
        <td class="table__item-contacts"><div class:="contacts-wrapper js-contacts-wrapper">${links}</div></td>
        <td>
          <button class="item-event-btn table__item-change-modal js-change-client">Изменить</button> 
          <button class="item-event-btn table__item-delete-item js-delete-client">Удалить</button>
        </td>
    </tr>
      `;
      table.innerHTML += client;
      const openModalBtn = document.querySelectorAll('.js-change-client');
      openModalBtn.forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.parentElement.parentElement.children[0].textContent;
          openModalChange(modalFormChange, id);
        });
      });
    });
  }

  function createLinkContacts(arr, wrap) {
    for (let i = 0; i < arr.length; i++) {
      if (i + 1 === 5) {
        hideContactsBtn = document.createElement('button');
        hideContactsBtn.textContent = '+' + (arr.length - 4);
        hideContactsBtn.className = ('contacts contacts__btn-hide');
        wrap.append(hideContactsBtn);
      }
      const point = document.createElement('a');
      point.className = 'contacts';
      point.href = arr[i].value;
      if (arr[i].type === 'Телефон') {
        point.classList.add('contacts__tel')
      };
      if (arr[i].type === 'Email') {
        point.classList.add('contacts__mail')
      };
      if (arr[i].type === 'Facebook') {
        point.classList.add('contacts__fb')
      };
      if (arr[i].type === 'Vk') {
        point.classList.add('contacts__vk')
      };
      if (arr[i].type === 'Другое') {
        point.classList.add('contacts__some-links')
      };
      if (arr[i].type === 'Доп.телефон') {
        point.classList.add('contacts__tel')
      };
      if (i + 1 >= 5) {
        point.hidden = true;
      }
      wrap.append(point);
    }
    return wrap;
  }

  inputs.forEach((item) => {
    if (item.dataset.form === 'input') {
      item.addEventListener('focus', () => {
        item.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)'
      });
      item.addEventListener('blur', () => {
        if (item.value === '') {
          item.previousElementSibling.style.cssText = 'transform: scale(143%) translateY(11px) translateX(58px);'
        };
      });
    };
  });

  function hideModal(screen, modal, contacts) {
    screen.style.cssText = ``;
    modal.style.transform = '';
    if (contacts === null || contacts === undefined) {
      return;
    } else {
      contacts.remove();
    }
  }

  addClientBtn.addEventListener('click', () => {
    const addContactBtn = document.querySelector('.js-btn-add-contact');
    console.log(addContactBtn);
    addContacts(addContactBtn);
    modalAddClient.style.cssText = `visibility: visible; opacity: 1;`;
    modalFormAdd.style.transform = 'scale(1)';
    modalFormAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      completeModalForm(modalFormAdd, 'null');
    })
    closeModal(modalFormAdd, modalAddClient)
  });

  function closeModal(form, screen) {
    modalCloseBtn.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const contacts = form.querySelectorAll('.contact');
        if (contacts.length > 0) {
          contacts.forEach(item => {
            const wrapper = item.parentElement;
            hideModal(screen, form, item);
            cheсkNChange(wrapper, 'close');
          })
        } else {
          hideModal(screen, form);
        };
      });
    });
  }

  async function openModalChange(form, id) {
    const response = await getClient(id);
    const clientId = document.querySelector('.js-client-id');
    const addContactBtn = document.querySelector('.js-btn-change-contact');
    console.log(addContactBtn);
    if (response.contacts.length === 10) {
      addContactBtn.style.display = 'none';
    } else {
      addContactBtn.style.display = 'block';
    }
    for (let i = 0; i < response.contacts.length; i++) {
      createContact(addContactBtn, response.contacts[i]);
    }
    clientId.textContent = `ID: ${id}`;
    form.lastname.value = response.lastName;
    form.lastname.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)';
    form.name.value = response.name;
    form.name.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)';
    form.surname.value = response.surname;
    form.surname.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)';
    modalChangeData.style.cssText = `visibility: visible; opacity: 1;`;
    modalFormChange.style.transform = 'scale(1)';
    modalFormChange.addEventListener('submit', (e) => {
      e.preventDefault();
      completeModalForm(modalFormChange, id);
    });
    closeModal(modalFormChange, modalChangeData)
    addContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addContacts(addContactBtn);
    });
  }

  function addContacts(btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mainWrapper = btn.parentElement;
      console.log(mainWrapper.childNodes.length - 2);
      if (mainWrapper.childNodes.length - 2 > 10) {
        btn.style.display = 'none';
      };
      cheсkNChange(mainWrapper, 'open');
      createContact(btn);
    });
  }

  function createContact(btn, contact) {
    const formContactWrapper = document.createElement('div');
    formContactWrapper.className = 'contact contact__data';

    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'select__wrapper';

    const select = document.createElement('div');
    select.className = 'selected__wrapper';
    const selected = document.createElement('span');
    selected.className = 'contact__selected';
    selected.textContent = 'Телефон';
    const arrow = document.createElement('div');
    arrow.className = 'select__arrow';
    select.append(selected, arrow);

    const selectBody = document.createElement('div');
    selectBody.className = 'select__body';

    const optionPhone = document.createElement('div');
    optionPhone.textContent = 'Телефон';
    const optionOtherPhone = document.createElement('div');
    optionOtherPhone.textContent = 'Доп.телефон';
    const optionEmail = document.createElement('div');
    optionEmail.textContent = 'Email';
    const optionVk = document.createElement('div');
    optionVk.textContent = 'Vk';
    const optionFacebook = document.createElement('div');
    optionFacebook.textContent = 'Facebook';
    const optionOther = document.createElement('div');
    optionOther.textContent = 'Другое';
    optionPhone.className = optionVk.className = optionEmail.className = optionFacebook.className = optionOther.className = optionOtherPhone.className = 'select__option js-select-option';

    const inputContact = document.createElement('input');
    inputContact.className = 'contact__input js-contact-input';
    inputContact.placeholder = 'Введите данные контакта';
    formContactWrapper.append(selectWrapper, inputContact);
    selectWrapper.append(select, selectBody)
    selectBody.append(optionPhone, optionOtherPhone, optionEmail, optionVk, optionFacebook, optionOther);
    const deleteContactBtn = document.createElement('button');
    deleteContactBtn.className = 'contact__button js-remove-contact';
    formContactWrapper.append(deleteContactBtn);

    deleteContactBtn.addEventListener('click', deleteContact);

    let options = selectBody.childNodes;
    options.forEach(item => {
      item.addEventListener('click', selectOption);
    });
    selectWrapper.addEventListener('click', () => {
      openSelect(selectBody, arrow);
    });
    if (contact === undefined || contact === null) {
      btn.before(formContactWrapper);
    } else {
      selected.textContent = contact.type;
      inputContact.value = contact.value;
      cheсkNChange(btn.parentElement, 'open')
      btn.before(formContactWrapper);
    };
  }

  function deleteContact() {
    let contact = this.parentElement;
    if (contact.parentElement.childNodes.length <= 4) {
      cheсkNChange(contact.parentElement, 'close')
    }
    const btnAddContact = this.parentElement.parentElement.lastElementChild;
    if (this.parentElement.parentElement.children.length - 2 < 10) {
      btnAddContact.style.display = 'block';
      // console.log(this.parentElement.parentElement.children.length - 2);
    }
    contact.remove();
  }

  function openSelect(body, arrow) {
    body.classList.toggle('in-active');
    arrow.classList.toggle('invert');
  }

  function selectOption() {
    let text = this.textContent;
    let currentText = this.parentElement.previousElementSibling.childNodes[0];
    currentText.innerHTML = text;
  }

  function cheсkNChange(wrap, button) {
    if (button === 'open') {
      wrap.style.padding = '25px 0';
    }
    if (button === 'close') {
      wrap.style.padding = '';
    }
  }

  deleteClient.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(item);
      if (item.parentElement.classList.contains('form')) {
        closeModal(modalChangeData, modalFormChange);
      }
      modalDeleteWrapper.style.cssText = `visibility: visible; opacity: 1;`;
      modalFormDelete.style.transform = 'scale(1)';
      modalFormDelete.addEventListener('submit', (e) => {
        e.preventDefault();
      })
      modalCloseBtn.forEach(item => {
        item.addEventListener('click', () => {
          closeModal(modalDeleteWrapper, modalFormDelete);
        });
      });
    })
  })

  function completeModalForm(form, id) {
    client = {};
    contacts = [];
    const contactData = document.querySelectorAll('.contact__data');
    contactData.forEach(item => {
      const contact = {};
      if (item.children[1].value !== '') {
        contact.type = item.children[0].value;
        contact.value = item.children[1].value;
      } else {
        return;
      }
      contacts.push(contact);
      return contacts;
    })
    if (form.elements.lastname.name === 'lastname') {
      if (form.lastname.value !== '') {
        client.lastName = form.lastname.value;
      } else {
        return;
      };
    }
    if (form.elements.name.name === 'name') {
      if (form.name.value !== '') {
        client.name = form.name.value;
      } else {
        return;
      };
    }
    if (form.elements.surname.name === 'surname') {
      if (form.surname.value !== '') {
        client.surname = form.surname.value;
      };
    }
    if (contacts !== []) {
      client.contacts = contacts;
    }
    if (id === 'null' || id === undefined) {
      postClient(client);
    } else {
      patchClient(id, client);
    };
  }

  async function patchClient(id, {
    lastName,
    name,
    surname,
    contacts
  }) {
    fetch(`http://localhost:3000/api/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        lastName,
        name,
        surname,
        contacts
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  async function postClient({
    lastName,
    name,
    surname,
    contacts
  }) {
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        lastName,
        name,
        surname,
        contacts
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return await response.json();
  }

  async function getClients() {
    const response = await fetch(`http://localhost:3000/api/clients`);
    return await response.json();
  }
  async function getClient(id) {
    const response = await fetch(`http://localhost:3000/api/clients/${id}`)
    return await response.json();
  }
})();