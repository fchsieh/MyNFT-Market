import React from "react";

const Navbar = () => {
  return (
    <nav class="navbar" style={{ backgroundColor: "#efefef", color: "white" }}>
      <div class="container">
        <a class="navbar-brand" href="/">
          My NFT
        </a>
        <ul class="nav nav-pills">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="/">
              Home
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="createItems">
              Create NFT
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="dashboard">
              Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="myAssets">
              My Assets
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
