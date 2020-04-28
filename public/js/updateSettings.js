const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'Password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert(`success`, `${type} Updated Successfully!`);
    }
  } catch (err) {
    showAlert(`error`, err.response.data.message);
  }
};

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-data').textContent = 'Updating...';
    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateSettings(form, 'Data');

    document.querySelector('.btn--save-data').textContent = 'Save settings';
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'Password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
