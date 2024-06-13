import { useState } from 'react';
import { uploadFile } from '../../../../server/services/s3';

const UplaodForm = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
 
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      uploadFile(file);
      console.log('File ready for upload:', file);
    } else {
      console.error('No file selected');
    }
  };

  return (
    <div className="upload-form-container">
      <form onSubmit={handleSubmit}>
        <label htmlFor="fileUpload">Upload a picture:</label>
        <input
          type="file"
          id="fileUpload"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" style={{ width: '200px', height: '200px' }} />
          </div>
        )}
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UplaodForm;