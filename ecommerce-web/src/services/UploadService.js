const UploadService = {
  toFormData(data) {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item) => {
          formData.append(`${key}[]`, item);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    return formData;
  },
};

export default UploadService;
