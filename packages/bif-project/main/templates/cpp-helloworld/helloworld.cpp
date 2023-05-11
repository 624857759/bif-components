#include <wasmio/wasmio.hpp>
#include <wasmio/system.hpp>

using namespace wasmio;

class [[wasmio::contract]] helloworld : public contract {
  public:
      using contract::contract;

      [[wasmio::action]]
      void hi( int32_t n ) {
         print("hi");
         std::string value;
         int result = wasmio::chain::load("testLoad",value);
         print(result);
         //print(n);
         //wasmio::check(0, "asdfsdf");
         //std::string value;
         //print(value);
         //print(wasmio::chain::load("testLoad",value));
         //print(value);
      }

      [[wasmio::action]]
      void chainload(const std::string& key, const std::string&expect_value, int expect_resut) {
         //std::string key = "hello-key";
         //std::string expect_value = "";
         //int expect_resut = -1;

         print("chainload");

         std::string value = "";
         int result = wasmio::chain::load(key, value);
         wasmio::utils::check(result == expect_resut, "check error");
         wasmio::utils::check(value == expect_value, "check error");

         print("chainload, end");
      }

      /*
            {
                "method": "chainstore",
                "params": {
                    "key": "hello-key",
                    "value": "hello-value",
                    "expect_resut":  0
                }
            }
      */
      [[wasmio::action]]
      void chainstore(const std::string& key, const std::string& value, int expect_resut) {
         //std::string key = "hello-key";
         //std::string value = "hello-value";
         //int expect_resut = 0;

         print("chainstore");
         int result = wasmio::chain::store(key, value);
         wasmio::utils::check(result == expect_resut, "check error");

         print("chainstore, end");
      }

      /*
            {
                "method": "chaindel",
                "params": {
                    "key": "hello-key"
                }
            }
      */
      [[wasmio::action]]
      void chaindel(const std::string& key, int expect_resut) {
         //std::string key = "hello-key";
         //int expect_resut = 0;

         print("chaindel");
         int result = wasmio::chain::del(key);
         wasmio::utils::check(result == expect_resut, "check error");

         print("chainstore, end");
      }


      /*
            {
                "method": "blockhash",
                "params": {
                    "offset_seq": 1,
                    "expect_resut":  0
                }
            }
      */
      //需要通过HTTP getAccountMetaData 接口查询 key = getBlockHash 的值是否符合预期
      [[wasmio::action]]
      void blockhash(int64_t offset_seq, int expect_resut) {

         //int64_t offset_seq = 1;
         //int expect_resut = 0;

         print("blockhash");
         std::string value;
         int result = chain::getBlockHash(offset_seq, value);
         wasmio::utils::check(result == expect_resut, "check error");
         if(result == 0){
             wasmio::chain::store("getBlockHash", value);
         }

         print("blockhash, end");
      }

      /*
            {
                "method": "chaintlog",
                "params": {
                    "topic": "topic",
                    "arg1": "1",
                    "arg2": "2",
                    "arg3": "3",
                    "arg4": "4",
                    "arg5": "5"
                }
            }
      */
      [[wasmio::action]]
      void chaintlog(const std::string &topic, const std::string &arg1, const std::string &arg2, const std::string &arg3, const std::string &arg4, const std::string &arg5) {
         //std::string topic = "hello-topic";
         //std::string arg1 = "hello-arg1";
         //std::string arg2 = "hello-arg2";
         //std::string arg3 = "hello-arg3";
         //std::string arg4 = "hello-arg4";
         //std::string arg5 = "hello-arg5";

         print("chaintlog");

         if(!arg5.empty()){
            wasmio::chain::tlog(topic, arg1, arg2, arg3, arg4, arg5);
         }
         else if(!arg4.empty()){
            wasmio::chain::tlog(topic, arg1, arg2, arg3, arg4);
         }
         else if(!arg3.empty()){
            wasmio::chain::tlog(topic, arg1, arg2, arg3);
         }
         else if(!arg2.empty()){
            wasmio::chain::tlog(topic, arg1, arg2);
         }
         else{
            wasmio::chain::tlog(topic, arg1);
         }


         print("chaintlog, end");
      }

      /*
            {
                "method": "metadata",
                "params": {
                    "address": "address",
                    "key": "hello-key",
                    "expect_value": "hello-value",
                    "expect_resut": 0
                }
            }
      */
      [[wasmio::action]]
      void metadata(const std::string &address, const std::string &key, const std::string &expect_value, int expect_resut) {

         std::string thisAddress = "";
         chain::thisAddress(thisAddress);

         //std::string address = thisAddress;
         //std::string key = "hello-key";
         //std::string expect_value = "hello-value";
         //int expect_resut = 0;

         print("metadata");

         std::string value = "";
         int result = wasmio::chain::getAccountMetadata(address, key, value);
         wasmio::utils::check(result == expect_resut, "check result error");
         if(result == 0){
            wasmio::utils::check(value == expect_value, "check value error");
         }

         print("metadata, end");
      }

      /*
            {
                "method": "balance",
                "params": {
                    "address": "address",
                    "key": "hello-key",
                    "expect_value": "hello-value",
                    "expect_resut": 0
                }
            }
      */
      [[wasmio::action]]
      void balance(const std::string &address, int64_t &expect_value) {

         std::string thisAddress = "";
         chain::thisAddress(thisAddress);
         //std::string address = thisAddress;
         //int64_t expect_value = 10000000;

         print("balance");
         int64_t result = wasmio::chain::getBalance(address);
         wasmio::utils::check(result == expect_value, "check result error");
         wasmio::chain::store("getBalance", std::to_string(result));

         print("balance, end");
      }

      /*
            {
                "method": "paycoin",
                "params": {
                    "address": "address",
                    "amount": 123,
                    "input": "hello-input",
                    "metadata": "metadata"
                }
            }
      */
      [[wasmio::action]]
      void paycoin(const std::string &address, int64_t &amount, const std::string &method, const std::string &abicode, const std::string &metadata) {
         //std::string address = "did:bid:ef2C5xyZgSENDmmaqsUv3kWnH3JrKgSBV";
         //int64_t amount = 100;
         //std::string input = "input";
         //std::string metadata = "hello-metadata";

         print("paycoin");
         int result = wasmio::chain::payCoin(address, amount, method, abicode, metadata);
         wasmio::utils::check(result == 0, "check result error");

         print("paycoin, end");
      }

      [[wasmio::action]]
      void paycoin1(const std::string &address1, const std::string &address2, const std::string &address3, const std::string &address4, const std::string &address5, int beyond) {
        print("paycoin1");

        std::tuple<std::string, std::string, std::string, std::string, int> params(address2, address3, address4, address5, beyond);
        std::string abicode = encode_base64(::pack(params));

        int result = wasmio::chain::payCoin(address1, 0, "paycoin2", abicode, "");
        wasmio::utils::check(result == 0, "check result error");

        print("paycoin, end");
      }

      [[wasmio::action]]
      void paycoin2(const std::string &address2, const std::string &address3, const std::string &address4, const std::string &address5, int beyond) {
         print("paycoin2");

         std::tuple<std::string, std::string, std::string, int> params(address3, address4, address5, beyond);
         std::string abicode = encode_base64(::pack(params));

         int result = wasmio::chain::payCoin(address2, 0, "paycoin3", abicode, "");
         wasmio::utils::check(result == 0, "check result error");

         print("paycoin, end");
      }

      [[wasmio::action]]
      void paycoin3(const std::string &address3, const std::string &address4, const std::string &address5, int beyond) {
         print("paycoin3");

         std::tuple<std::string, std::string, int> params(address4, address5, beyond);
         std::string abicode = encode_base64(::pack(params));
         int result = wasmio::chain::payCoin(address3, 0, "paycoin4", abicode, "");
         wasmio::utils::check(result == 0, "check result error");

         print("paycoin, end");
      }

      [[wasmio::action]]
      void paycoin4(const std::string &address4, const std::string &address5, int beyond) {
         print("paycoin4");

         std::tuple<std::string, int> params(address5, beyond);
         std::string abicode = encode_base64(::pack(params));

         if(beyond == 1){
            int result = wasmio::chain::payCoin(address4, 0, "paycoin5", abicode, "");
         }
         else{
             wasmio::chain::store("paycoin4", "cannot to store");
         }
         //int result = wasmio::chain::payCoin(address4, 0, "paycoin5", abicode, "");
         //wasmio::utils::check(result == 0, "check result error");
         //wasmio::chain::store("paycoin4", "cannot to store");

         print("paycoin, end");
      }

      [[wasmio::action]]
      void paycoin5(const std::string &address5, int beyond) {
         print("paycoin5");

         print("paycoin, end");
      }
      /*
            {
                "method": "timestamp",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询保存的值是否符合预期
      [[wasmio::action]]
      void timestamp() {
         print("timestamp");
         int64_t timestamp = chain::block::timestamp();
         wasmio::chain::store("hello-timestamp", std::to_string(timestamp));

         print("timestamp, end");
      }

      /*
            {
                "method": "number",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询保存的值是否符合预期
      [[wasmio::action]]
      void number() {
         print("number");
         int64_t number = chain::block::number();
         wasmio::chain::store("hello-number", std::to_string(number));

         print("number, end");
      }

      /*
            {
                "method": "txinitiator",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询 key = hello-tx-initiator 保存的值是否符合预期
      [[wasmio::action]]
      void txinitiator() {
         print("txinitiator");
         std::string initiator;
         chain::tx::initiator(initiator);
         wasmio::chain::store("hello-tx-initiator", initiator);

         print("txinitiator, end");
      }

      /*
            {
                "method": "txsender",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询 key = hello-tx-sender 保存的值是否符合预期
      [[wasmio::action]]
      void txsender() {
         print("txsender");
         std::string sender;
         chain::tx::sender(sender);
         wasmio::chain::store("hello-tx-sender", sender);

         print("txsender, end");
      }

      /*
            {
                "method": "txgasprice",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询 key= hello-tx-gasPrice 值是否符合预期
      [[wasmio::action]]
      void txgasprice() {
         print("txgasprice");
         int64_t gasPrice = chain::tx::gasPrice();
         wasmio::chain::store("hello-tx-gasPrice", std::to_string(gasPrice));

         print("txgasprice, end");
      }

      /*
            {
                "method": "txhash",
                "params": {
                }
            }
      */
      [[wasmio::action]]
      void txhash() {
         print("txhash");
         std::string hash = "";
         chain::tx::hash(hash);
         //wasmio::utils::check(hash == expect_value, "check result error");
         wasmio::chain::store("hello-tx-hash", hash);

         print("txhash, end");
      }

      /*
            {
                "method": "txfeelimit",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询  key = hello-tx-feeLimit 保存的值是否符合预期
      [[wasmio::action]]
      void txfeelimit() {
         print("txfeelimit");
         int64_t feeLimit = chain::tx::feeLimit();
         wasmio::chain::store("hello-tx-feeLimit", std::to_string(feeLimit));

         print("txfeelimit, end");
      }

      /*
            {
                "method": "msginitiator",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询 key = hello-msg-initiator是否符合预期
      [[wasmio::action]]
      void msginitiator() {
         print("msginitiator");
         std::string initiator;
         chain::msg::initiator(initiator);
         wasmio::chain::store("hello-msg-initiator", initiator);

         print("msginitiator, end");
      }

      /*
            {
                "method": "msgsender",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询保存 key = hello-msg-sender 值是否符合预期
      [[wasmio::action]]
      void msgsender() {
         print("msgsender");
         std::string sender;
         chain::msg::sender(sender);
         wasmio::chain::store("hello-msg-sender", sender);

         print("msgsender, end");
      }

      /*
            {
                "method": "coinamount",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询 key = hello-msg-coinAmount 的值是否符合预期
      [[wasmio::action]]
      void coinamount() {
         print("coinamount");
         int64_t coinAmount = chain::msg::coinAmount();
         wasmio::chain::store("hello-msg-coinAmount", std::to_string(coinAmount));

         print("coinamount, end");
      }

      /*
            {
                "method": "msgnonce",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询 key = msg_nonce 的值是否符合预期
      [[wasmio::action]]
      void msgnonce() {
         print("msgnonce");
         int64_t nonce = chain::msg::nonce();
         wasmio::chain::store("hello-msg-nonce", std::to_string(nonce));

         print("msgnonce, end");
      }

       /*
            {
                "method": "operationidx",
                "params": {
                }
            }
      */
      //需要从外部调用 getAccountMetaData 查询 key = hello-msg-operationIndex 的值是否符合预期
      [[wasmio::action]]
      void operationidx() {
         print("operationidx");
         int64_t operationIndex = chain::msg::operationIndex();
         wasmio::chain::store("hello-msg-operationIndex", std::to_string(operationIndex));

         print("operationidx, end");
      }

       /*
            {
                "method": "thisaddress",
                "params": {
                }
            }
      */
      [[wasmio::action]]
      void thisaddress(/*const std::string &expect_value*/) {
         print("thisaddress");
         std::string thisAddress = "";
         chain::thisAddress(thisAddress);
         //wasmio::utils::check(thisAddress == expect_value, "check result error");
         wasmio::chain::store("hello-thisaddress", thisAddress);

         print("thisaddress, end");
      }

      /*
            {
                "method": "utilslog",
                "params": {
                    "log_info": "hello, log info"
                }
            }
      */
      [[wasmio::action]]
      void utilslog(const std::string &log_info) {
         //std::string log_info = "hello, log info.";

         print("utilslog");
         utils::log(log_info);

         print("utilslog, end");
      }

      /*
            {
                "method": "intadd",
                "params": {
                    "left_value": 1,
                    "right_value": 1,
                    "expect_value": 2
                }
            }
      */
      [[wasmio::action]]
      void intadd(int64_t left_value, int64_t right_value, int64_t expect_value) {
         //int64_t left_value = 70;
         //int64_t right_value = 30;
         //int64_t expect_value = 100;

         print("intadd");
         int64_t result = utils::int64Add(left_value, right_value);
         wasmio::utils::check(result == expect_value, "check result error");

         print("intadd, end");
      }

      /*
            {
                "method": "intsub",
                "params": {
                    "left_value": 1,
                    "right_value": 1,
                    "expect_value": 2
                }
            }
      */
      [[wasmio::action]]
      void intsub(int64_t left_value, int64_t right_value, int64_t expect_value) {
         //int64_t left_value = 10000;
         //int64_t right_value = 3000;
         //int64_t expect_value = 7000;

         print("intsub");
         int64_t result = utils::int64Sub(left_value, right_value);
         wasmio::utils::check(result == expect_value, "check result error");

         print("intsub, end");
      }

      /*
            {
                "method": "intmul",
                "params": {
                    "left_value": 1,
                    "right_value": 1,
                    "expect_value": 2
                }
            }
      */
      [[wasmio::action]]
      void intmul(int64_t left_value, int64_t right_value, int64_t expect_value) {
         //int64_t left_value = 100;
         //int64_t right_value = 5;
         //int64_t expect_value = 500;

         print("intmul");
         int64_t result = utils::int64Mul(left_value, right_value);
         wasmio::utils::check(result == expect_value, "check result error");

         print("intmul, end");
      }

      /*
            {
                "method": "intmod",
                "params": {
                    "left_value": 1,
                    "right_value": 1,
                    "expect_value": 2
                }
            }
      */
      [[wasmio::action]]
      void intmod(int64_t left_value, int64_t right_value, int64_t expect_value) {
         //int64_t left_value = 3003;
        // int64_t right_value = 134;
         //int64_t expect_value = 55;

         print("intmod");
         int64_t result = utils::int64Mod(left_value, right_value);
         wasmio::utils::check(result == expect_value, "check result error");

         print("intmod, end");
      }

      /*
            {
                "method": "intdiv",
                "params": {
                    "left_value": 1,
                    "right_value": 1,
                    "expect_value": 2
                }
            }
      */
      [[wasmio::action]]
      void intdiv(int64_t left_value, int64_t right_value, int64_t expect_value) {
         //int64_t left_value = 1000;
         //int64_t right_value = 500;
         //int64_t expect_value = 2;

         print("intdiv");
         int64_t result = utils::int64Div(left_value, right_value);
         wasmio::utils::check(result == expect_value, "check result error");

         print("intdiv, end");
      }

      /*
            {
                "method": "addresscheck",
                "params": {
                    "address": "address",
                    "checkChainCode": 1,
                    "expect_resut": 2
                }
            }
      */
      [[wasmio::action]]
      void addresscheck(const std::string &address, int checkChainCode, int64_t expect_resut) {
         //std::string address = "did:bid:ef2C5xyZgSENDmmaqsUv3kWnH3JrKgSBV";
         //int checkChainCode = 0;
         //int64_t expect_resut = 0;

         print("addresscheck");
         int ret = utils::addressCheck(address, checkChainCode);
         utils::check(ret == expect_resut, "check error");

         print("addresscheck, end");
      }

      [[wasmio::action]]
      void pack() {
         print("pack");

         std::tuple<std::string, std::string, std::string, int> params("123", "456", "789", 111);
         std::string abicode = encode_base64(::pack(params));

         int result = wasmio::chain::store("pack", abicode);

         //utils::check(ret == expect_resut, "check error");

         print("pack, end");
      }

      [[wasmio::action]]
      void dowhile() {
         while(true){

         }
      }
};