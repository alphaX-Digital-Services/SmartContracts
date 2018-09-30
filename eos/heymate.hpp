#include <eosiolib/eosio.hpp>
#include <eosiolib/crypto.h>

using std::string;

class heymate : public eosio::contract{
public:
    upland(account_name self)
        : contract(self){}
private:
    struct upsinput{
      uint64_t upsquare_id;
      double latitude;
      double longitude;
    };
    //@abi table properties i64
    struct property {
      uint64_t property_id;
      double latitude;
      double longitude;
      auto primary_key() const {return property_id;}
      EOSLIB_SERIALIZE(property, (property_id)(latitude)(longitude));
    };
    typedef eosio::multi_index<N(properties), property> properties;

    //@abi table upsquares i64
    struct upsquare {
      uint64_t upsquare_id;
      uint64_t property_id;
      account_name owner;
      double latitude;
      double longitude;
      auto primary_key() const {return upsquare_id;}
      uint64_t get_prop_id() const {return property_id;}
      account_name get_owner() const {return owner;}
      EOSLIB_SERIALIZE(upsquare, (upsquare_id)(property_id)(owner)(latitude)(longitude));
    };
    typedef eosio::multi_index<N(upsquares), upsquare, 
            eosio::indexed_by<N(bypropid), eosio::const_mem_fun<upsquare, uint64_t, &upsquare::get_prop_id>>,
            eosio::indexed_by<N(byowner), eosio::const_mem_fun<upsquare, account_name, &upsquare::get_owner>>
            > upsquares;
public:
    void createups(const uint64_t& property_id, const uint64_t& upsquare_id, const double& latitude, const double& longitude);

    void createprop(const uint64_t& property_id, const double& latitude, const double& longitude);
    
    void createset(const uint64_t& property_id, const std::vector<upsinput>& upsquare_ids);

    void transferprop(account_name from, account_name to, const uint64_t& property_id);

    void transferups(account_name from, account_name to, const uint64_t& upsquare_id);
};
