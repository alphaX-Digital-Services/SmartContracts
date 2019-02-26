#include "reputation.hpp"
#ifdef STAGING
  #include "../staging-config.hpp"
#else
  #include "../dev-config.hpp"
#endif

namespace heymate {

ACTION reputation::mint(name owner, uint64_t amount)
{
  require_auth(name(ESCROW).value);
  eosio_assert(amount > 0, "amount should be higher than zero");
  eosio_assert(is_account(owner.value), "owner account does not exist");

  add_balance(owner, amount);
}

ACTION reputation::burn(name owner, uint64_t amount)
{
  require_auth(name(ESCROW).value);
  eosio_assert(amount > 0, "amount should be higher than zero");
  eosio_assert(is_account(owner.value), "owner account does not exist");

  sub_balance(owner, amount);
}

ACTION reputation::transfer(name from, name to, uint64_t amount)
{
  require_auth(name(ESCROW).value);
  eosio_assert(is_account(to), "to account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");

  add_balance(to, amount);
  sub_balance(from, amount);
}

void reputation::sub_balance(name owner, uint64_t value)
{
  accounts_index accounts(_self, _self.value);
  const auto& found_account = accounts.get(owner.value, "no balance object found");
  eosio_assert(found_account.balance >= value, "overdrawn balance");

  if(found_account.balance == value) {
    accounts.erase(found_account);
  } else {
    accounts.modify(found_account, _self, [&](auto& account) {
      account.balance -= value;
    });
  }
}

void reputation::add_balance(name owner, uint64_t value)
{
  accounts_index accounts(_self, _self.value);
  auto found_account = accounts.find(owner.value);

  if(found_account == accounts.end()) {
    accounts.emplace(_self, [&](auto& account){
      account.owner = owner;
      account.balance = value;
    });
  } else {
    accounts.modify(found_account, _self, [&](auto& account) {
      account.balance += value;
    });
  }
}

} /// namespace heymate

EOSIO_DISPATCH(heymate::reputation, (mint)(burn)(transfer))
