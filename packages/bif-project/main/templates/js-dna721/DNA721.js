'use strict';

// 管理员  
const FUNDATION = "_fundation";

// 代币名称
const NAME = "_name";

// 代币符号
const SYMBOL = "_symbol";

// metadata uri
const TOKENURI = "_tokenUri";

// 账户有 几个NFT      address => uint256
const BALANCEOF = "_balanceOf";

// NFT 属于哪个账户的    uint256 => address
var TOKENS = "_tokens";

// 授权集合    uint256 => address
const ALLOWANCES = "_allowances";

// 全部 NFT 的授权集合    address => mapping(address => bool)
const ISALLAPPROVED = "_isAllApproved";

// enumeration
// 所有nft的tokenId 数组     address[]
const ALLTOKENS = "_allTokens";

// tokenId  => 在所有nft中的 index      address => uint256
const ALLTOKENSINDEX = "_allTokensIndex";

// tokenId => owner里面的index    address => uint256
const OWNEDTOKENSINDEX = "_ownedTokensIndex";

// 账户地址  => nft的tokenId 数组     address => address[]
const OWNEDTOKENS = "_ownedTokens";

const sender_g = Chain.msg.sender;
const chainCode_g = Chain.chainCode;

/*
	是否为合约所有者
*/
function isContractOwner(){
    var owner = Chain.load(FUNDATION);
    if(Chain.msg.sender === owner){
        return true;
    }
    else{
        Utils.log("onlyFundation can call this method!");
        return false;
    }
}

function _setTokenURI(newuri) {
    Chain.store(TOKENURI, newuri);
}

function setTokenURI(params) {

    if(isContractOwner() === false){
        Utils.log('setTokenURI' + Chain.msg.sender);
        return;
    }

    var tokenUri = params.tokenUri;
    _setTokenURI(tokenUri);
}

function init(input_str){

    var input = JSON.parse(input_str);
    var params = input.params;

    Utils.log('input_str: (' + input_str + ').');

    if(params.name=== undefined || params.symbol === undefined || params.tokenUri === undefined ||
        !params.name.length || !params.symbol.length || !params.tokenUri.length){     
        Utils.assert(false , "DNA721: init  params is invalid, please check!");
    }

    Chain.store(NAME, params.name);
    Chain.store(SYMBOL, params.symbol);
    _setTokenURI(params.tokenUri);
    Chain.store(FUNDATION, sender_g);
    return;
} 


// metadata
function name() {
    return Chain.load("_name");
}
function symbol() {
    return Chain.load("_symbol");
}

function _exists(tokenId) {

    var tokens = {}; // 二维数组
    var dataToken = JSON.parse(Chain.load(TOKENS));
    if (dataToken) {
        tokens = dataToken;
    }

    if (tokens[tokenId] !== undefined){
        return true;
    }else{
        return false;  
    }
}

// return string
function tokenURI(params) {
    
    var tokenId = params.tokenId;
    Utils.assert(Utils.addressCheck(tokenId) , "DNA721: tokenURI for params: tokenId is invalid bid address");
    Utils.log('tokenId: ' + params.tokenId);

    Utils.assert(_exists(tokenId), "DNA721: URI query for nonexistent token");
    var tokenUri = Chain.load(TOKENURI);

    if(tokenUri.length > 0){
        
        return tokenUri + tokenId;
    }
    return "";
}

// 必须实现 ----  9个方法
function balanceOf(params) {

    var owner = params.owner; 

    Utils.assert(Utils.addressCheck(owner) , "DNA721: balanceOf query for params: owner is invalid bid address");

    var balances = {};
    var data = JSON.parse(Chain.load(BALANCEOF));
    if (data) {
        balances = data;
    }

    if (balances[owner] !== undefined){
        return balances[owner];  
    }else{
        return 0;    
    }
}

// 代币的地址
function _ownerOf(tokenId) {

    var tokens = {}; 
    var dataToken = JSON.parse(Chain.load(TOKENS));
    if (dataToken) {
        tokens = dataToken;
    }

    var owner = "";
    if (tokens[tokenId] !== undefined){
        owner = tokens[tokenId];  
    }
    
    Utils.assert(owner.length !== 0, "DNA721: owner query for nonexistent token");
    return owner;
}

/**
* 返回NFT的 拥有者。
* @param params 
* @param params.tokenId 代币的标识符

*/
function ownerOf(params) {

    var tokenId = params.tokenId;
    Utils.assert(Utils.addressCheck(tokenId) , "DNA721: ownerOf for params: tokenId is invalid bid address");
    return _ownerOf(tokenId);
}


// for enumeration
function _addTokenToOwnerEnumeration(to, tokenId) {

    // 1 
    var ownedTokens = {}; 
    var data = JSON.parse(Chain.load(OWNEDTOKENS));
    if (data) {
        ownedTokens = data;
    }
    
    var ownedTokensIndex = {}; 
    var dataIndex = JSON.parse(Chain.load(OWNEDTOKENSINDEX));
    if (dataIndex) {
        ownedTokensIndex = dataIndex;
    }

    if (ownedTokens[to] !== undefined){
        ownedTokensIndex[tokenId] = ownedTokens[to].length;   
    }else{
        ownedTokens[to] = [];
        ownedTokensIndex[tokenId] = 0;
    }

    // 2 
    ownedTokens[to].push(tokenId);

    // 3. store ownedTokens、_ownedTokensIndex
    Chain.store(OWNEDTOKENS, JSON.stringify(ownedTokens));
    Chain.store(OWNEDTOKENSINDEX, JSON.stringify(ownedTokensIndex));
}

function _addTokenToAllTokensEnumeration(tokenId) {

    // 1 
    var allTokens = []; 
    var dataAll = JSON.parse(Chain.load(ALLTOKENS));
    if (dataAll) {
        allTokens = dataAll;
    }

    var allTokensIndex = {}; 
    var data = JSON.parse(Chain.load(ALLTOKENSINDEX));
    if (data) {
        allTokensIndex = data;
    }

    // 2
    allTokensIndex[tokenId] = allTokens.length;
    allTokens.push(tokenId);

    // 3. store ownedTokens、_ownedTokensIndex
    Chain.store(ALLTOKENS, JSON.stringify(allTokens));
    Chain.store(ALLTOKENSINDEX, JSON.stringify(allTokensIndex));
}


function _removeTokenFromOwnerEnumeration(from, tokenId) {

    // 1
    var ownedTokens = {}; 
    var data = JSON.parse(Chain.load(OWNEDTOKENS));
    if (data) {
        ownedTokens = data;
    }else{
        Utils.assert(false, "DNA721: removeTokenFromOwnerEnumeration ownedTokens is null");
    }

    var ownedTokensIndex = {}; 
    var dataIndex = JSON.parse(Chain.load(OWNEDTOKENSINDEX));
    if (dataIndex) {
        ownedTokensIndex = dataIndex;
    }

    // 2
    // 为了保护数组的顺序，将最后一个元素挪到 要删除的元素 的角标处
    var lastTokenIndex = ownedTokens[from].length - 1;
    var tokenIndex = ownedTokensIndex[tokenId];

    if (tokenIndex !== lastTokenIndex) {
        var lastTokenId = ownedTokens[from][lastTokenIndex];

        ownedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
        ownedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
    }

    ownedTokens[from].length = ownedTokens[from].length - 1;

    // 3. store ownedTokens、_ownedTokensIndex
    Chain.store(OWNEDTOKENS, JSON.stringify(ownedTokens));
    Chain.store(OWNEDTOKENSINDEX, JSON.stringify(ownedTokensIndex));
}

/**
* 创建NFT。
* @param _tokenId 代币的标识符
* @param owner 拥有者
*/
function mint(params) {

    if(isContractOwner() === false){
        Utils.log('mint' + Chain.msg.sender);
        return;
    }

    var to = params.to;
    var tokenId = params.tokenId;
    Utils.log('mint-params: ' + params);

    Utils.assert(Utils.addressCheck(to) , "DNA721: mint to is not bid address");
    Utils.assert(Utils.addressCheck(tokenId) , "DNA721: mint tokenId is not bid address");
    Utils.assert(!_exists(tokenId), "DNA721: token already minted");

    var balances = {}; 
    var data = JSON.parse(Chain.load(BALANCEOF));
    if (data) {
        balances = data;
    }

    if (balances[to] !== undefined){
        var temp = balances[to];
        balances[to] = temp + 1;  
    }else{
        balances[to] = 1;  
    }
      
    // 读取 tokens 集合
    var tokens = {};
    var dataToken = JSON.parse(Chain.load(TOKENS));
    if (dataToken) {
        tokens = dataToken;
    }

    tokens[tokenId] = to;

    Chain.store(BALANCEOF, JSON.stringify(balances));
    Chain.store(TOKENS, JSON.stringify(tokens));

    // for enumeration
    _addTokenToOwnerEnumeration(to, tokenId);
    _addTokenToAllTokensEnumeration(tokenId);
     
    Chain.tlog('Transfer', '', to, tokenId);
}

function __setApproved( tokenId, to) {

    // 读取 allowance 集合
    var allowances = {}; 
    var data = JSON.parse(Chain.load(ALLOWANCES));
    if (data) {
        allowances = data;
    }

    allowances[tokenId] = to;
    Chain.store(ALLOWANCES, JSON.stringify(allowances));
}

function _approve( to, tokenId)  {

    __setApproved( tokenId, to);

    Chain.tlog('Approval', _ownerOf(tokenId), to, tokenId);
}

function _getApproved(tokenId) {

    Utils.assert(_exists(tokenId), "DNA721: approved query for nonexistent token");
    
    // 读取 allowance 集合
    var allowances = {};
    var data = JSON.parse(Chain.load(ALLOWANCES));
    if (data) {
        allowances = data;
    }

    if (allowances[tokenId] !== undefined){
        
        return allowances[tokenId]; 
    }else{
        return "";  
    }
}

function getApproved(params) {
    var input = params; // tokenId

    return _getApproved(input.tokenId);
}

function __getIsAllApproved(owner, to){

    // 读取 全部授权的集合
    var allApproved = {}; 
    var data = JSON.parse(Chain.load(ISALLAPPROVED));
    if (data) {
        allApproved = data;
    }
    
    if (allApproved[owner] === undefined ){
        return false;
    }

    return allApproved[owner][to];
}

function _isApprovedForAll( owner, operator) {

    Utils.assert(Utils.addressCheck(owner) , "DNA721: _isApprovedForAll params: owner is invalid bid address");
    Utils.assert(Utils.addressCheck(operator) , "DNA721: _isApprovedForAll params: operator is invalid bid address");

    return  __getIsAllApproved(owner, operator);
}

function isApprovedForAll(params) {

    var input = params; // owner, operator
    return _isApprovedForAll(input.owner, input.operator);
}

function __setAllApproved(owner, to, isAllApproved){
    
    // 读取 全部授权的集合
    var allApproved = {}; 
    var data = JSON.parse(Chain.load(ISALLAPPROVED));
    if (data) {
        allApproved = data;
    }

    var inner_allApproved = {};
    
    if (allApproved[owner] === undefined ){
        allApproved[owner] = inner_allApproved; 
    }
    
    Utils.log("allApproved:" + allApproved);
    
    allApproved[owner][to] = isAllApproved;

    Utils.log("allApproved after:" + allApproved);

    Chain.store(ISALLAPPROVED, JSON.stringify(allApproved));
}

function _setApprovalForAll(owner, operator, isApproved) {

    Utils.assert(Utils.addressCheck(owner) , "DNA721: _setApprovalForAll params: owner is invalid bid address");
    Utils.assert(Utils.addressCheck(operator) , "DNA721: _setApprovalForAll params: operator is invalid bid address");
    Utils.assert(owner !== operator, "DNA721: approve to caller");
    // 设置 全部授权
    __setAllApproved(owner, operator, isApproved);
    Chain.tlog('ApprovalForAll', owner, operator, isApproved);
}

// 设置 全部授权
function setApprovalForAll( params )  {

    return _setApprovalForAll(sender_g, params.operator, params.isApproved);
}

function _transfer(
     from,
     to,
     tokenId,
     data_params
)  {

    Utils.log('_ownerOf(tokenId): (' + _ownerOf(tokenId) + ').');
    Utils.log('from: (' + from + ').');

    Utils.assert(Utils.addressCheck(from) , "DNA721: transfer params: from is invalid bid address");
    Utils.assert(Utils.addressCheck(to) , "DNA721: transfer params: to is invalid bid address");
    Utils.assert(Utils.addressCheck(tokenId) , "DNA721: transfer params: tokenId is invalid bid address");

    Utils.assert(_ownerOf(tokenId) === from, "DNA721: transfer from incorrect owner");

    _approve('', tokenId);

    var balances = {}; 
    var data = JSON.parse(Chain.load(BALANCEOF));
    if (data) {
        balances = data;
    }

    if (balances[from] !== undefined){
        var temp = balances[from];
        balances[from] = temp - 1;  
    }

    if (balances[to] !== undefined){
        var tempTo = balances[to];
        balances[to] = tempTo + 1; 
    }else{
        balances[to] = 1; 
    }
    
    // 读取 tokens 集合
    var tokens = {};
    var dataToken = JSON.parse(Chain.load(TOKENS));
    if (dataToken) {
        tokens = dataToken;
    }

    tokens[tokenId] = to;

    Chain.store(BALANCEOF, JSON.stringify(balances));
    Chain.store(TOKENS, JSON.stringify(tokens));

    // for enumeration
    _removeTokenFromOwnerEnumeration(from, tokenId);
    _addTokenToOwnerEnumeration(to, tokenId);

    Chain.tlog('Transfer', from, to, tokenId);
}

function _isApprovedOrOwner(spender, tokenId)  {

    Utils.log("_exists(tokenId): " + _exists(tokenId));
    Utils.assert(_exists(tokenId), "DNA721: operator query for nonexistent token");

    var owner = _ownerOf(tokenId);
    Utils.log("owner: " + owner);
    Utils.log("_getApproved(tokenId): " + _getApproved(tokenId));
    Utils.log("_isApprovedForAll(owner, spender): " + _isApprovedForAll(owner, spender));
    return (spender === owner || _getApproved(tokenId) === spender || _isApprovedForAll(owner, spender));
}

function approve( params )  {

    var input = params; // to,  tokenId

    Utils.assert(Utils.addressCheck(input.to), "DNA721: approve params: to is invalid bid address");
    Utils.assert(Utils.addressCheck(input.tokenId), "DNA721: approve params: tokenId is invalid bid address");

    var owner = _ownerOf(input.tokenId);
    Utils.assert(input.to !== owner, "DNA721: approval to current owner");
    Utils.log("approve-sender_g:" + sender_g + "  owner:" + owner);
    Utils.assert(
        sender_g === owner || _isApprovedForAll(owner, sender_g),
        "DNA721: approve caller is not owner nor approved for all"
    );

    _approve(input.to, input.tokenId);
}

function transferFrom(params) {

    var input = params; // from、to、tokenId
    
    Utils.assert(_isApprovedOrOwner(sender_g, input.tokenId), "DNA721: transfer caller is not owner nor approved");

    _transfer(input.from, input.to, input.tokenId, "");
}

function safeTransferFrom(params) {

    var from = params.from; // from
    var to = params.to; // to
    var tokenId = params.tokenId; // tokenId
    var data = params.data; // data

    // safe check

    // _transfer
    Utils.assert(_isApprovedOrOwner(sender_g, tokenId), "DNA721: transfer caller is not owner nor approved");
    _transfer(from, to, tokenId, data);
}


// enumeration
// return int
function totalSupply() {
    
    var allTokens = []; 
    var dataAll = JSON.parse(Chain.load(ALLTOKENS));
    if (dataAll) {
        allTokens = dataAll;
    }
    return allTokens.length;
}

// return tokenId -> address
function tokenByIndex(params) {
    var index = params.index;
    
    Utils.assert(index%1 === 0, "DNA721 tokenByIndex: your index should be int");
    Utils.assert(index >= 0, "DNA721 tokenByIndex: your index <= 0");
    Utils.assert(index < totalSupply(), "DNA721 tokenByIndex: global index out of bounds");

    var allTokens = []; 
    var dataAll = JSON.parse(Chain.load(ALLTOKENS));
    if (dataAll) {
        allTokens = dataAll;
    }
    return allTokens[index];
}

// return tokenId -> address
function tokenOfOwnerByIndex(params) {
    var owner = params.owner;
    var index = params.index;

    Utils.assert(index%1 === 0, "DNA721 tokenOfOwnerByIndex: your index should be int");
    Utils.assert(Utils.addressCheck(owner) , "DNA721: tokenOfOwnerByIndex params: owner is invalid bid address");
    Utils.assert(index >= 0, "DNA721 tokenOfOwnerByIndex: your index <= 0");
    Utils.assert(index < balanceOf(params), "DNA721 Enumerable: owner index out of bounds"); // 注意：使用 params
    var ownedTokens = {}; 
    var data = JSON.parse(Chain.load(OWNEDTOKENS));
    if (data) {
        ownedTokens = data;
    }
    return ownedTokens[owner][index];
}

function main(input_str){
    var input = JSON.parse(input_str);

    if(input.method === 'mint'){
        mint(input.params);
    }
    else if(input.method === 'transferFrom'){
        transferFrom(input.params);
    }else if(input.method === 'safeTransferFrom'){
        safeTransferFrom(input.params);
    }else if(input.method === 'approve') {
        approve(input.params);
    }else if(input.method === 'setApprovalForAll') {
        setApprovalForAll(input.params);
    }
 
    else{
        throw '<Main interface passes an invalid operation type>';
    }
}

function query(input_str){
    var input  = JSON.parse(input_str);
    var object ={};
    if(input.method === 'name'){
        object = name();
    }else if(input.method === 'symbol'){
        object = symbol();
    }else if(input.method === 'tokenURI'){
        object = tokenURI(input.params);
    }else if(input.method === 'totalSupply'){
        object = totalSupply();
    }else if(input.method === 'tokenByIndex'){
        object = tokenByIndex(input.params);
    }else if(input.method === 'tokenOfOwnerByIndex'){
        object = tokenOfOwnerByIndex(input.params);
    }else if(input.method === 'balanceOf'){
        object = balanceOf(input.params);
    }else if(input.method === 'ownerOf'){
        object = ownerOf(input.params);
    }else if(input.method === 'isApprovedForAll'){
        object = isApprovedForAll(input.params);
    }else if(input.method === 'getApproved'){
        object = getApproved(input.params);
    }
    else{
       	throw '<unidentified operation type>';
    }
    return JSON.stringify(object);
}