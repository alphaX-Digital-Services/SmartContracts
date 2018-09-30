#pragma once

#include <eosiolib/asset.hpp>
#include <eosiolib/eosio.hpp>
#include <string>

namespace heymate {

  using std::string;

  class reputation : public contract {
    public:
      reputation(account_name self):contract(self){}

      void mint(account_name account, uint64_t amount);

      void burn(account_name account, uint64_t amount);

      void approve(account_name owner, account_name spender, uint64_t amount);

      void transfer_from(account_name from, account_name to, uint64_t amount);

    private:
      bool transfer_allowed(account_name owner, account_name spender, uint64_t amount);

      struct account {
        account_name owner;
        uint64_t balance;

        uint64_t primary_key()const { return owner; }

        EOSLIB_SERIALIZE(account, (owner)(balance));
      };

      struct allowance {
        account_name owner;
        account_name spender;
        uint64_t amount;

        uint64_t primary_key()const { return owner; }

        EOSLIB_SERIALIZE(account, (owner)(spender)(amount));
      };

      typedef eosio::multi_index<N(account), account> accounts_index;
      typedef eosio::multi_index<N(allowance), account> allowances_index;

      void sub_balance(account_name owner, uint64_t value);
      void add_balance(account_name owner, uint64_t value);
   };
} /// namespace heymate
