#include "reputation.hpp"

namespace heymate {

ACTION reputation::mint(name owner, uint64_t amount)
{
  require_auth(_self);
  eosio_assert(amount > 0, "amount should be higher than zero");
  eosio_assert(is_account(owner.value), "owner account does not exist");

  add_balance(owner, amount);
}

ACTION reputation::burn(name caller, name owner, uint64_t amount)
{
  require_auth("escrow"_n);
  eosio_assert(amount > 0, "amount should be higher than zero");
  eosio_assert(is_account(owner.value), "owner account does not exist");

  sub_balance(owner, amount);
}

ACTION reputation::approve(name owner, name spender, uint64_t amount)
{
  require_auth(owner.value);
  eosio_assert(is_account(spender.value), "spender account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");

  add_allowance(owner, spender, amount);
}

ACTION reputation::transferto(name from, name to, uint64_t amount)
{
  eosio_assert(is_account(from.value), "from account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");
  eosio_assert(transfer_allowed(from, to, amount), "transfer is not allowed");

  add_balance(to, amount);
  sub_balance(from, amount);
  sub_allowance(from, to, amount);
}

ACTION reputation::transfer(name from, name to, uint64_t amount)
{
  require_auth(from.value);
  eosio_assert(is_account(to), "to account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");

  add_balance(to, amount);
  sub_balance(from, amount);
}

bool reputation::transfer_allowed(name from, name to, uint64_t amount)
{
  allowances_index allowances(_self, from.value);
  auto found_allowance = allowances.find(to.value);

  return found_allowance != allowances.end() && amount <= found_allowance->amount;
}

void reputation::add_allowance(name owner, name spender, uint64_t value)
{
  allowances_index allowances(_self, owner.value);
  auto found_allowance = allowances.find(spender.value);

  if(found_allowance == allowances.end()) {
    allowances.emplace(_self, [&](auto& allowance) {
      allowance.spender = spender;
      allowance.amount = value;
    });
  } else {
    allowances.modify(found_allowance, _self, [&](auto& allowance) {
      allowance.amount += value;
    });
  }
}

void reputation::sub_allowance(name owner, name spender, uint64_t value)
{
  allowances_index allowances(_self, owner.value);
  const auto& found_allowance = allowances.get(spender.value, "no allowance object found");
  eosio_assert(found_allowance.amount >= value, "overdrawn amount");

  if(found_allowance.amount == value) {
    allowances.erase(found_allowance);
  } else {
    allowances.modify(found_allowance, _self, [&](auto& allowance) {
      allowance.amount -= value;
    });
  }
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

EOSIO_DISPATCH(heymate::reputation, (mint)(burn)(approve)(transferto)(transfer))
