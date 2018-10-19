#pragma once

#include <eosiolib/eosio.hpp>

using namespace eosio;

namespace heymate {

  CONTRACT pay : public contract {
    using contract::contract;

    public:
      ACTION mint(name account, uint64_t amount);

      ACTION approve(name owner, name spender, uint64_t amount);

      ACTION transferto(name from, name to, uint64_t amount);

      ACTION transfer(name from, name to, uint64_t amount);
    private:

      TABLE account {
        name owner;
        uint64_t balance;

        uint64_t primary_key() const { return owner.value; }
      };

      TABLE allowance {
        name spender;
        uint64_t amount;

        uint64_t primary_key() const { return spender.value; }
      };

      typedef multi_index<"accounts"_n, account> accounts_index;
      typedef multi_index<"allowances"_n, allowance> allowances_index;

      bool transfer_allowed(name from, name to, uint64_t amount);

      void sub_balance(name owner, uint64_t value);
      void add_balance(name owner, uint64_t value);

      void add_allowance(name owner, name spender, uint64_t value);
      void sub_allowance(name owner, name spender, uint64_t value);
   };
} /// namespace heymate
