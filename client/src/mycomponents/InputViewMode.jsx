import React from 'react'

const InputViewMode = ({ value, isEditable }) => {
  return (
    value ?
      <p className={`mb-[4%] border rounded-lg px-4 py-2 
        ${isEditable ? "text-gray-700 border-gray-200" : "text-gray-400 border-gray-100"}`}>
        {value}
      </p>
      :
      <></>
  );
};

export default InputViewMode