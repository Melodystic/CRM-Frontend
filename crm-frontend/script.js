(async () => {
  const searchInput = document.querySelector('.js-header-search');
  const addContactBtn = document.querySelectorAll('.js-btn-add-contact');
  const addClientBtn = document.querySelector('.js-add-client');
  const modalFormAdd = document.querySelector('.js-form-add');
  const modalFormChange = document.querySelector('.js-form-change');
  const table = document.querySelector('.js-table');
  const inputs = document.querySelectorAll('input');
  const modalAddWrapper = document.querySelector('.js-modal-add-client');
  const modalChangeWrapper = document.querySelector('.js-modal-change-data');
  const modalDeleteWrapper = document.querySelector('.js-modal-delete-client');
  const modalFormDelete = document.querySelector('.js-form-delete');
  const modalScreens = document.querySelectorAll('.modal');
  table.parentElement.style.marginBottom = '0';
  addClientBtn.style.display = 'none';
  let click = 0;
  const once = {
    once: true
  };

  function debounce(fn, debounceTime) {
    let timerId;

    function wrapper() {
      function foo() {
        return fn();
      }
      clearTimeout(timerId);
      timerId = setTimeout(foo, debounceTime);
    }
    return wrapper;
  }
  async function assigment() {
    const items = table.querySelectorAll('.js-item-row');
    items.forEach(elem => {
      elem.remove();
    })
    return createClientList(await getClientSearch(searchInput.value));
  }
  const imputTimeout = debounce(assigment, 300);
  searchInput.addEventListener('input', imputTimeout);

  createClientList(await getClients(), 'api');

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

  async function createClientList(response, source) {
    if (source === 'api') {
      sortBy(response, 'id');
      let arrow = document.getElementById('idArrow');
      arrow.classList.toggle('table__header-rotate');
      const loading = document.querySelector('.table__white-screen');
      loading.style.display = 'none';
      table.parentElement.style.marginBottom = '40px';
      return;
    }
    response.forEach((item) => {
      let wrapLinks = document.createElement('div');
      wrapLinks.className = 'contacts-wrapper js-contacts-wrapper';
      let links = createLinkContacts(item.contacts, wrapLinks);
      const dateCreate = interpretateDate(item.createdAt);
      const dateChange = interpretateDate(item.updatedAt);
      const client = `
      <tr class="table__item js-item-row">
      <td class="table__item-id">${item.id}</td>
      <td class="table__item-fio">${item.surname + ' ' + item.name + ' ' + item.lastName}</td>
      <td class="table__item-date">${dateCreate.date} <span class="table__item-time">${dateCreate.time}</span></td>
      <td class="table__item-date">${dateChange.date} <span class="table__item-time">${dateChange.time}</span></td>
      <td class="table__item-contacts">${links.outerHTML}</td>
      <td>
      <button class="item-event-btn table__item-change-modal js-change-client">Изменить</button> 
      <button class="item-event-btn table__item-delete-item js-delete-client">Удалить</button>
      </td>
      </tr>
      `;
      table.innerHTML += client;
      const showContactsBtn = document.querySelectorAll('.js-contacts-btn-hide');
      showContactsBtn.forEach(btn => {
        btn.addEventListener('click', hidesContactsBtn);
      })
      const deleteClientBtn = document.querySelectorAll('.js-delete-client');
      deleteClientBtn.forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          let id;
          if (btn.parentElement.classList.contains('form')) {
            id = btn.parentElement.children[0].children[1].textContent;
            id = id.split(' ');
            id = id[1];
          } else {
            id = btn.parentElement.parentElement.children[0].textContent;
          }
          openModalDelete(btn, id)
        })
      })
      const modalChangeBtn = document.querySelectorAll('.js-change-client');
      modalChangeBtn.forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.parentElement.parentElement.children[0].textContent;
          openModalChange(modalFormChange, id);
        });
      });
    });
    addClientBtn.style.display = 'block';
    sortBtnListeners(response)
  }

  function sortBtnListeners(response) {
    const sortIdBtn = document.querySelector('.js-sort-id');
    const sortFioBtn = document.querySelector('.js-sort-fio');
    const sortAddBtn = document.querySelector('.js-sort-add');
    const sortChangeBtn = document.querySelector('.js-sort-change');

    sortIdBtn.addEventListener('click', () => {
      sortBy(response, 'id');
      click++;
      let arrow = document.getElementById('idArrow');
      arrow.classList.toggle('table__header-rotate');
    })
    sortFioBtn.addEventListener('click', () => {
      sortBy(response, 'fio');
      click++;
      let arrow = document.getElementById('fioArrow');
      arrow.classList.toggle('table__header-rotate');
    })
    sortAddBtn.addEventListener('click', () => {
      sortBy(response, 'add');
      click++;
      let arrow = document.getElementById('addArrow');
      arrow.classList.toggle('table__header-rotate');
    })
    sortChangeBtn.addEventListener('click', () => {
      sortBy(response, 'change');
      click++;
      let arrow = document.getElementById('changeArrow');
      arrow.classList.toggle('table__header-rotate');
    })
  }

  function sortBy(arr, btn) {
    const temp = JSON.parse(JSON.stringify(arr));
    temp.forEach(item => {
      item.family = item.lastName.charCodeAt(0);
    })
    if (btn === 'id') {
      temp.sort((a, b) => +a.id > +b.id ? 1 : -1);
    }
    if (btn === 'fio') {
      temp.sort((a, b) => a.family > b.family ? 1 : -1);
    }
    if (btn === 'add') {
      temp.sort((a, b) => a.createSort > b.createSort ? 1 : -1);
    }
    if (btn === 'change') {
      temp.sort((a, b) => a.changeSort > b.changeSort ? 1 : -1);
    }
    if (click % 2 !== 0) {
      temp.reverse();
    }
    temp.forEach(item => {
      delete item.family;
      delete item.createSort;
      delete item.changeSort;
    })
    const rows = document.querySelectorAll('.js-item-row');
    rows.forEach(elem => {
      elem.remove();
    })
    createClientList(temp);
  }

  function createLinkContacts(arr, wrap) {
    for (let i = 0; i < arr.length; i++) {
      if (i + 1 === 5) {
        hideContactsBtn = document.createElement('button');
        hideContactsBtn.textContent = '+' + (arr.length - 4);
        hideContactsBtn.className = ('contacts__btn-hide js-contacts-btn-hide');
        wrap.append(hideContactsBtn);
      }
      const point = document.createElement('a');
      point.className = 'contacts';
      point.href = arr[i].value;
      point.setAttribute('data-href', arr[i].value)
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

  function hidesContactsBtn() {
    this.parentElement.childNodes.forEach(elem => {
      if (elem.hidden) {
        elem.hidden = false;
        this.hidden = true;
      }
    })
  }

  inputs.forEach((item) => {
    if (item.dataset.form === 'input') {
      item.addEventListener('focus', () => {
        item.style = '';
        item.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)'
      });
      item.addEventListener('blur', () => {
        if (item.value === '') {
          item.previousElementSibling.style.cssText = 'transform: scale(143%) translateY(11px) translateX(58px);'
        };
      });
    };
  });

  function closeModal(form, screen) {
    const loading = form.querySelector('.btn-loading-svg');
    loading.style.display = 'none';
    loading.parentElement.style = '';
    const inputs = form.querySelectorAll('input');
    inputs.forEach(item => {
      item.value = '';
    })
    const wrapper = form.querySelector('.form__add_contacts-wrapper');
    const contacts = form.querySelectorAll('.contact');
    if (contacts.length > 0) {
      cheсkNChange(wrapper, 'close');
      contacts.forEach(elem => {
        elem.remove();
      })
    };
    hideModal(screen, form);
  }

  function hideModal(screen, modal) {
    screen.style = '';
    modal.style = '';
    location.hash = '';
  }

  if (location.hash !== '') {
    const id = window.location.hash.substring(1);
    openModalChange(modalFormChange, id);
  }

  addClientBtn.addEventListener('click', openModalAdd);

  function openModalAdd() {
    modalAddWrapper.style.cssText = `visibility: visible; opacity: 1;`;
    modalFormAdd.style.transform = 'scale(1)';
    submitBtn = modalFormAdd.querySelector('.js-submit-btn');

    modalFormAdd.addEventListener('submit', submitAdd, once);

    function submitAdd(e) {
      e.preventDefault();
      completeModalForm(modalFormAdd, 'null', e);
    }

    closeBtn = modalFormAdd.querySelectorAll('.js-close-modal');
    closeBtn.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        closeModal(modalFormAdd, modalAddWrapper);
        modalFormAdd.removeEventListener('submit', submitAdd, once);
      })
    })
    modalAddWrapper.addEventListener('click', (e) => {
      modalFormAdd.addEventListener('click', event => {
        event._isClickWhithinModal = true;
      })
      if (e._isClickWhithinModal) {
        return;
      }
      closeModal(modalFormAdd, modalAddWrapper);
      modalFormAdd.removeEventListener('submit', submitAdd, once);
    })
  }

  async function openModalChange(form, id) {
    if (location.hash !== id) {
      window.location.hash = id;
    }
    const submitBtn = form.querySelector('.js-submit-btn');
    submitBtn.style.backgroundColor = 'var(--activeFirm)';
    const loadingCircleBtn = form.querySelector('.btn-loading-svg');
    loadingCircleBtn.style.display = 'inline';
    modalChangeWrapper.style.cssText = `visibility: visible; opacity: 1;`;
    modalFormChange.style.transform = 'scale(1)';
    const response = await getClient(id);
    if (!!response) {
      loadingCircleBtn.style.display = 'none';
      submitBtn.style.backgroundColor = 'var(--firm)';
    }
    const clientId = form.querySelector('.js-client-id');
    const addContactBtn = form.querySelector('.js-btn-add-contact');
    for (let i = 0; i < response.contacts.length; i++) {
      if (response.contacts.length >= 10) {
        addContactBtn.style.display = 'none';
      } else if (response.contacts.length < 9) {
        addContactBtn.style.display = 'block';
      }
      createContact(addContactBtn, response.contacts[i]);
    }
    clientId.textContent = `ID: ${id}`;
    form.lastname.value = response.lastName;
    form.lastname.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)';
    form.name.value = response.name;
    form.name.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)';
    form.surname.value = response.surname;
    form.surname.previousElementSibling.style.cssText = 'transform: scale(100%) translateY(0) translateX(0)';

    form.addEventListener('submit', submitChange, once);

    function submitChange(e) {
      e.preventDefault();
      completeModalForm(modalFormChange, id);
    }

    const closeBtn = form.querySelector('.js-close-modal');
    closeBtn.addEventListener('click', e => {
      e.preventDefault();
      form.removeEventListener('submit', submitChange, once);
      closeModal(modalFormChange, modalChangeWrapper);
    })

    modalChangeWrapper.addEventListener('click', (e) => {
      modalFormChange.addEventListener('click', event => {
        event._isClickWhithinModal = true;
      })
      if (e._isClickWhithinModal) {
        return;
      }
      closeModal(modalFormChange, modalChangeWrapper);
      form.removeEventListener('submit', submitChange, once);
    })
  }

  function openModalDelete(btn, id) {
    const itemClient = btn.parentElement.parentElement;
    btn.parentElement.classList.contains('form') ? hideModal(modalFormChange, modalChangeWrapper) : '';
    modalDeleteWrapper.style.cssText = `visibility: visible; opacity: 1;`;
    modalFormDelete.style.transform = 'scale(1)';
    const submitLoadingCircle = modalFormDelete.querySelector('.btn-loading-svg');
    const submitBtn = modalFormDelete.querySelector('.js-submit-btn');

    modalFormDelete.addEventListener('submit', submitDelete, once);

    const closeBtn = modalFormDelete.querySelectorAll('.js-close-modal');
    closeBtn.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        closeModal(modalFormDelete, modalDeleteWrapper);
        modalFormDelete.removeEventListener('submit', submitDelete, once);
      })
    })

    modalFormDelete.parentElement.addEventListener('click', (e) => {
      modalFormDelete.addEventListener('click', event => {
        event._isClickWhithinModal = true;
      })
      if (e._isClickWhithinModal) {
        return;
      }
      closeModal(modalFormDelete, modalDeleteWrapper);
      modalFormDelete.removeEventListener('submit', submitDelete, once);
    })

    function submitDelete(e) {
      e.preventDefault();
      submitLoadingCircle.style.display = 'inline-block';
      submitBtn.style.backgroundColor = 'var(--activeFirm)';
      closeModal(modalFormDelete, modalDeleteWrapper);
      itemClient.style.cssText = 'transition: transform .3s linear; transform: scale(50%);';
      setTimeout(() => {
        itemClient.remove();
        deleteClient(id);
      }, 300)
    }
  }

  addContactBtn.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const mainWrapper = item.parentElement;
      if (mainWrapper.childNodes.length - 2 >= 10) {
        item.style.display = 'none';
      };
      cheсkNChange(mainWrapper, 'open');
      createContact(item);
    });
  })

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
    if (contact === undefined || contact === 'null') {
      btn.before(formContactWrapper);
    } else {
      selected.textContent = contact.type;
      inputContact.value = contact.value;
      cheсkNChange(btn.parentElement, 'open');
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

  async function completeModalForm(form, id) {
    client = {};
    contacts = [];
    const submitLoadingCircle = form.querySelector('.btn-loading-svg');
    const submitBtn = form.querySelector('.js-submit-btn');
    const contactData = form.querySelectorAll('.contact__data');
    if (contactData.length > 0) {
      contactData.forEach(item => {
        const contact = {};
        if (item.children[1].value !== '') {
          contact.type = item.children[0].children[0].textContent;
          contact.value = item.children[1].value;
        } else {
          return;
        }
        contacts.push(contact);
        return contacts;
      });
    };
    if (form.elements.surname.name === 'surname') {
      if (form.surname.value !== '') {
        client.surname = form.surname.value;
      } else {
        return;
      };
    };
    if (form.elements.name.name === 'name') {
      if (form.name.value !== '') {
        client.name = form.name.value;
      } else {
        return;
      };
    }
    if (form.elements.lastname.name === 'lastname') {
      if (form.lastname.value !== '') {
        client.lastName = form.lastname.value;
      };
    };
    if (contacts.length !== 0) {
      client.contacts = contacts;
    };

    const tableItems = document.querySelectorAll('.js-item-row');
    tableItems.forEach(item => {
      item.remove();
    })
    table.parentElement.style.marginBottom = '0';
    const loading = document.querySelector('.table__white-screen');
    loading.style.display = 'flex';
    addClientBtn.style.display = 'none';

    if (id === 'null' || id === undefined) {
      submitLoadingCircle.style.display = 'inline-block';
      submitBtn.style.backgroundColor = 'var(--activeFirm)';
      await postClient(client, form);
      createClientList(await getClients(), 'api');
      closeModal(modalFormAdd, modalAddWrapper);
    } else {
      submitLoadingCircle.style.display = 'inline-block';
      submitBtn.style.backgroundColor = 'var(--activeFirm)';
      await patchClient(id, client);
      createClientList(await getClients(), 'api');
      closeModal(modalFormChange, modalChangeWrapper);
    };
  }

  async function patchClient(id, {
    lastName,
    name,
    surname,
    contacts
  }) {
    await fetch(`http://localhost:3000/api/clients/${id}`, {
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
  }, form) {
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
    if (response.status === 422) {
      const errors = await response.json();
      const errorText = document.createElement('p');
      errorText.className = 'form__error';
      errorText.textContent = `Ошибка: ${errors.errors[0].message}`;
      const submitBtn = form.querySelector('.form__submit');
      const errorElem = form.querySelectorAll('.form__error');
      if (errorElem.length === 0) {
        submitBtn.before(errorText);
      } else {
        return;
      }
      errorText.previousElementSibling.style.marginBottom = '0';
      if (errors.errors[0].field === 'surname') {
        form.surname.style.borderBottom = '1px solid red';
      }
      if (errors.errors[0].field === 'name') {
        form.name.style.borderBottom = '1px solid red';
      }
    } else {
      return await response.json();
    }
  }
  async function getClients() {
    const response = await fetch(`http://localhost:3000/api/clients`);
    return await response.json();
  }
  async function getClient(id) {
    const response = await fetch(`http://localhost:3000/api/clients/${id}`);
    return await response.json();
  }
  function deleteClient(id) {
    fetch(`http://localhost:3000/api/clients/${id}`, {
      method: 'DELETE',
    })
  }
  async function getClientSearch(value) {
    const response = await fetch(`http://localhost:3000/api/clients/?search=${value}`);
    return await response.json();
  }
})();