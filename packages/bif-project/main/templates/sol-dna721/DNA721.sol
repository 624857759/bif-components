
pragma solidity ^0.4.26;

contract DNA721  {

    address public fundation; // 管理员  
    
    // 代币名称
    string private _name;

    // 代币符号
    string private _symbol;

    // metadata uri
    string private _tokenUri;

    // NFT 属于哪个账户的  tokenId => owner
    mapping(address => address) private _tokens;

    // 账户有 几个NFT
    mapping(address => uint256) private _balanceOf;

    // 授权集合 tokenId => approve
    mapping(address => address) private _allowances;

    // Mapping from owner to operator approvals 全部 NFT 的授权集合
    mapping(address => mapping(address => bool)) private _isAllApproved;

    // enumeration
    mapping(address => address[]) private _ownedTokens;
    mapping(address => uint256) private _ownedTokensIndex;
    address[] private _allTokens;
    mapping(address => uint256) private _allTokensIndex;

    
    // 三个事件
    event Transfer(address indexed _from, address indexed _to, address indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, address indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /**
     * 初始化构造
     */
    function DNA721(string name_, string symbol_, string tokenUri_) public {
        require(bytes(name_).length != 0, "DNA721: mint to the zero name_");
        require(bytes(symbol_).length != 0, "DNA721: mint to the zero symbol_");
        require(bytes(tokenUri_).length != 0, "DNA721: mint to the zero tokenUri_");

        _name = name_;
        _symbol = symbol_;
	    fundation = msg.sender; 
        _setTokenURI(tokenUri_);                         
    }  

    modifier onlyFundation() {
        require(msg.sender == fundation,"onlyFundation can call this");
        _;
    }

    // metadata
    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function _setTokenURI(string memory newuri) internal {
        _tokenUri = newuri;
    }

    function setTokenURI(string memory uri) onlyFundation public {
        _setTokenURI(uri);
    }
    
    function tokenURI(address tokenId) public view  returns (string memory) {
        require(_exists(tokenId), "DNA721: URI query for nonexistent token");
        return bytes(_tokenUri).length > 0 ? string(abi.encodePacked(_tokenUri, _toHexString(uint192(tokenId), 24))) : "";
    }

    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0x00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return _toHexString(value, length);
    }

    function _toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        bytes16 _HEX_SYMBOLS = "0123456789abcdef";
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _HEX_SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    // enumeration
    function totalSupply() public view returns (uint256) {
        return _allTokens.length;
    }

    function tokenByIndex(uint256 index) public view returns (address) {
        require(index >= 0, "DNA721 tokenByIndex: your index <= 0");
        require(index < totalSupply(), "DNA721 tokenByIndex: global index out of bounds");

        return _allTokens[index];
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (address) {
        require(index >= 0, "DNA721 tokenOfOwnerByIndex: your index <= 0");
        require(index < balanceOf(owner), "DNA721 tokenOfOwnerByIndex: owner index out of bounds");
        return _ownedTokens[owner][index];
    }

    // 必须实现 ----  9个方法
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "DNA721: balance query for the zero address");
        return _balanceOf[owner];
    }

    // 代币的地址
    function ownerOf(address tokenId) public view returns (address) {
        address owner = _tokens[tokenId];
        require(owner != address(0), "DNA721: owner query for nonexistent token");
        return owner;
    }

    /**
     * 创建NFT。
     * @param to 接收方
     * @param tokenId 代币的标识符
     */
    function mint(address to, address tokenId) public onlyFundation {
        require(to != address(0), "DNA721: mint to the zero address");
        require(!_exists(tokenId), "DNA721: token already minted");

        _balanceOf[to] += 1;
        _tokens[tokenId] = to;

        // for enumeration
        _addTokenToOwnerEnumeration(to, tokenId);
        _addTokenToAllTokensEnumeration(tokenId);

        emit Transfer(address(0), to, tokenId);
    }
    
    function _burn(address tokenId) internal {
        address owner = DNA721.ownerOf(tokenId);

        // Clear approvals
        _approve(address(0), tokenId);

        _balanceOf[owner] -= 1;
        delete _tokens[tokenId];

        emit Transfer(owner, address(0), tokenId);
    }
    
    function transferFrom(
        address from,
        address to,
        address tokenId
    ) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "DNA721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    /**
     * 从地址转账。合约调用方须是经过_from授权的账户
     * @param from 发送方
     * @param to 接收方
     * @param tokenId 代币的标识符
     */
    function _transfer(
        address from,
        address to,
        address tokenId
    ) internal {
        require(DNA721.ownerOf(tokenId) == from, "DNA721: transfer from incorrect owner");
        require(to != address(0), "DNA721: transfer to the zero address");

        _approve(address(0), tokenId);

        _balanceOf[from] -= 1;
        _balanceOf[to] += 1;
        _tokens[tokenId] = to;

        // for enumeration
        _removeTokenFromOwnerEnumeration(from, tokenId);
        _addTokenToOwnerEnumeration(to, tokenId);

        emit Transfer(from, to, tokenId);
    }

    // 要实现转账，先实现授权。
    function safeTransferFrom(
        address from,
        address to,
        address tokenId
    ) public {
        safeTransferFrom(from, to, tokenId, "");
    }
    
    function safeTransferFrom(
        address from,
        address to,
        address tokenId,
        bytes memory _data
    ) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "DNA721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }
    
    function _safeTransfer(
        address from,
        address to,
        address tokenId,
        bytes memory _data
    ) internal {
        _transfer(from, to, tokenId);
    }


    /**
     * 授权
     * @param to 接受授权的账户地址
     * @param tokenId 代币的标识符
     */
    function approve(address to, address tokenId) public  {
        address owner = DNA721.ownerOf(tokenId);
        require(to != owner, "DNA721: approval to current owner");

        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "DNA721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }
    
    function _approve(address to, address tokenId) internal {
        _allowances[tokenId] = to;
        emit Approval(DNA721.ownerOf(tokenId), to, tokenId);
    }

    /**
     * 查看接受授权的账户地址
     * @param tokenId 代币的标识符
     */
    function getApproved(address tokenId) public view  returns (address) {
        require(_exists(tokenId), "DNA721: approved query for nonexistent token");

        return _allowances[tokenId];
    }
    
    function _exists(address tokenId) internal view returns (bool) {
        return _tokens[tokenId] != address(0);
    }

    /**
     * 拥有者将其所有NFT进行全部授权
     * @param operator 接受授权的账户地址
     * @param approved 是否授权
     */
    function setApprovalForAll(address operator, bool approved) public {
        _setApprovalForAll(msg.sender, operator, approved);
    }
   
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal {
        require(owner != operator, "DNA721: approve to caller");
        _isAllApproved[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }
    
    function isApprovedForAll(address owner, address operator) public view returns (bool) {

        require(owner != address(0), "_owner can not be empty!");
        require(operator != address(0), "_operator can not be empty!");

        return  _isAllApproved[owner][operator];
    }
        
    function _isApprovedOrOwner(address spender, address tokenId) internal view returns (bool) {
        require(_exists(tokenId), "DNA721: operator query for nonexistent token");
        address owner = DNA721.ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function _tokensOfOwner(address owner) internal view returns (address[] storage) {
        return _ownedTokens[owner];
    }

    // enumeration
    function _addTokenToOwnerEnumeration(address to, address tokenId) private {
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length;
        _ownedTokens[to].push(tokenId);
    }

    function _addTokenToAllTokensEnumeration(address tokenId) private {
        _allTokensIndex[tokenId] = _allTokens.length;
        _allTokens.push(tokenId);
    }

    // 用于transfer的
    function _removeTokenFromOwnerEnumeration(address from, address tokenId) private {
        // 为了保护数组的顺序，将最后一个元素挪到 要删除的元素 的角标处
        uint256 lastTokenIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            address lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _ownedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        _ownedTokens[from].length--;
    }
    // 用于销毁机制的
    function _removeTokenFromAllTokensEnumeration(address tokenId) private {
        // 为了保护数组的顺序，将最后一个元素挪到 要删除的元素 的角标处
        uint256 lastTokenIndex = _allTokens.length - 1;
        uint256 tokenIndex = _allTokensIndex[tokenId];

        address lastTokenId = _allTokens[lastTokenIndex];

        _allTokens[tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
        _allTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index

        // This also deletes the contents at the last position of the array
        _allTokens.length--;
        _allTokensIndex[tokenId] = 0;
    }

}