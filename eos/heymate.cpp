#include "upland.hpp"

using namespace eosio;

//@abi action
void upland::createups(const uint64_t& property_id, const uint64_t& upsquare_id, const double& latitude, const double& longitude){
  eosio::print("createups: ",  property_id, ' ', upsquare_id, ' ', latitude, ' ', longitude);
  require_auth(_self);
  properties properties_table(_self, _self);
  upsquares upsquares_table(_self, _self);
  auto iprop = properties_table.find(property_id);
  eosio_assert(iprop != properties_table.end(), "property doesn't exist");
  auto iups = upsquares_table.find(upsquare_id);
  eosio_assert(iups == upsquares_table.end(), "upsquare already exists");
  upsquares_table.emplace(_self, [&](auto &ups) {
      ups.owner = _self;
      ups.property_id = property_id;
      ups.upsquare_id = upsquare_id;
      ups.latitude = latitude;
      ups.longitude = longitude;
  });
  eosio::print("createups: creation finished");
}

//@abi action
void upland::createprop(const uint64_t& property_id, const double& latitude, const double& longitude){
  eosio::print("createprop: ",  property_id, ' ', latitude, ' ', longitude);
  require_auth(_self);
  properties properties_table(_self, _self);
  auto iprop = properties_table.find(property_id);
  eosio_assert(iprop == properties_table.end(), "property already exists");
  properties_table.emplace(_self, [&](auto &prop) {
      prop.property_id = property_id;
      prop.latitude = latitude;
      prop.longitude = longitude;
  });
  eosio::print("createprop: creation finished");
}

//@abi action
void upland::createset(const uint64_t& property_id, const std::vector<upsinput>& upsquares){
  eosio::print("createset: ",  property_id);
  require_auth(_self);
  for(auto upsquare: upsquares){
    eosio::print(upsquare.upsquare_id);
  } 
  properties properties_table(_self, _self);
  auto iprop = properties_table.find(property_id);
  eosio_assert(iprop != properties_table.end(), "property doesn't exists");
  upland::upsquares upsquares_table(_self, _self);
  for(auto upsquare: upsquares){
    auto itr = upsquares_table.find(upsquare.upsquare_id);
    eosio_assert(itr == upsquares_table.end(), "upsquare already exists");
    upsquares_table.emplace(_self, [&](auto &ups) {
      ups.owner = _self;
      ups.property_id = property_id;
      ups.upsquare_id = upsquare.upsquare_id;
      ups.latitude = upsquare.latitude;
      ups.longitude = upsquare.longitude;
    });
  }  
  eosio::print("createset: creation finished");
}

//@abi action
void upland::transferprop(account_name from, account_name to, const uint64_t& property_id){
  eosio::print("transferprop: ",  name{from}, ' ', name{to}, ' ', property_id);
  require_auth(from);
  upsquares upsquares_table(_self, _self);
  auto prop_id_idx = upsquares_table.get_index<N(bypropid)>();
  auto itr = prop_id_idx.find(property_id);
  eosio_assert(itr != prop_id_idx.end(), "there is no upsqares related to the property");
  for(;itr != prop_id_idx.end() && itr->property_id == property_id; ++itr){
    prop_id_idx.modify(itr, _self, [&](auto &ups){
      ups.owner = to;
    });
  }
  eosio::print("transferprop: creation finished");
}  
//@abi action
void upland::transferups(account_name from, account_name to, const uint64_t& upsquare_id){
  eosio::print("transferups: ",  name{from}, ' ', name{to}, ' ', upsquare_id);
  require_auth(from);
  upsquares upsquares_table(_self, _self);
  auto itr = upsquares_table.find(upsquare_id);
  eosio_assert(itr != upsquares_table.end(), "upsquare doesn't exist");
  upsquares_table.modify(itr, _self, [&](auto &ups) {
      ups.owner = to;
  });
  eosio::print("transferups: creation finished");
}

EOSIO_ABI(upland, (createups)(createprop)(createset)(transferprop)(transferups))
