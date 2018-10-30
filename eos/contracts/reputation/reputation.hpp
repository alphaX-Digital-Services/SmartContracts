#pragma once

#include <eosiolib/eosio.hpp>

using namespace eosio;

namespace heymate {

  CONTRACT reputation : public contract {
    using contract::contract;

    public:
      ACTION mint(name account, uint64_t amount);

      ACTION burn(name account, uint64_t amount);

      ACTION transfer(name from, name to, uint64_t amount);
    private:

      TABLE account {
        name owner;
        uint64_t balance;

        uint64_t primary_key() const { return owner.value; }
      };

      typedef multi_index<"accounts"_n, account> accounts_index;

      void sub_balance(name owner, uint64_t value);
      void add_balance(name owner, uint64_t value);
   };
} /// namespace heymate
