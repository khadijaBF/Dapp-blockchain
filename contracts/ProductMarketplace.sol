// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductMarketplace {
    struct Product {
        uint id;
        string title;
        string description;
        uint price;
        address payable seller;
        address owner;
        bool isSold;
    }

    uint public productCount = 0;
    mapping(uint => Product) public products;
    mapping(address => uint[]) public ownedProducts;

    event ProductCreated(
        uint id,
        string title,
        string description,
        uint price,
        address seller
    );

    event ProductPurchased(
        uint id,
        address buyer,
        uint price
    );

    // Create a product for sale
    function createProduct(
        string memory _title,
        string memory _description,
        uint _price
    ) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        productCount++;
        products[productCount] = Product(
            productCount,
            _title,
            _description,
            _price,
            payable(msg.sender),
            address(0), // Owner initially is zero address
            false
        );

        ownedProducts[msg.sender].push(productCount); // Track seller's product

        emit ProductCreated(productCount, _title, _description, _price, msg.sender);
    }

    // Purchase a product
    function purchaseProduct(uint _id) public payable {
        Product storage product = products[_id];
        require(_id > 0 && _id <= productCount, "Product does not exist");
        require(msg.value == product.price, "Incorrect price");
        require(!product.isSold, "Product already sold");
        require(msg.sender != product.seller, "Seller cannot buy own product");

        // Transfer funds to seller
        product.seller.transfer(msg.value);
        
        // Update product ownership and status
        product.owner = msg.sender;
        product.isSold = true;

        ownedProducts[msg.sender].push(_id); // Track buyer's owned product

        emit ProductPurchased(_id, msg.sender, msg.value);
    }

    // Get all owned products by an address
    function getOwnedProducts(address _owner) public view returns (uint[] memory) {
        return ownedProducts[_owner];
    }

    // Fetch product details by id
    function getProductDetails(uint _id) public view returns (
        uint id,
        string memory title,
        string memory description,
        uint price,
        address seller,
        address owner,
        bool isSold
    ) {
        Product memory product = products[_id];
        return (product.id, product.title, product.description, product.price, product.seller, product.owner, product.isSold);
    }
}
