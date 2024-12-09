const React = require('react');
const { render } = require('@testing-library/react');
const { BrowserRouter } = require('react-router-dom');

const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
module.exports = {
  ...require('@testing-library/react'),
  render: customRender,
};
