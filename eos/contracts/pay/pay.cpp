#include "pay.hpp"

namespace heymate {

//@abi action
void pay::mint(account_name owner, uint64_t amount)
{
  require_auth(_self);
  eosio_assert(amount > 0, "amount should be higher than zero");
  eosio_assert(is_account(owner), "owner account does not exist");

  add_balance(owner, amount);
}

//@abi action
void pay::approve(account_name owner, account_name spender, uint64_t amount)
{
  require_auth(owner);
  eosio_assert(is_account(spender), "spender account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");

  add_allowance(owner, spender, amount);
}

//@abi action
void pay::transferto(account_name from, account_name to, uint64_t amount)
{
  eosio_assert(is_account(from), "from account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");
  eosio_assert(transfer_allowed(from, to, amount), "transfer is not allowed");

  add_balance(to, amount);
  sub_balance(from, amount);
  sub_allowance(from, to, amount);
}

//@abi action
void pay::transfer(account_name from, account_name to, uint64_t amount)
{
  require_auth(from);
  eosio_assert(is_account(to), "to account does not exist");
  eosio_assert(amount > 0, "amount should be higher than zero");

  add_balance(to, amount);
  sub_balance(from, amount);
}

bool pay::transfer_allowed(account_name from, account_name to, uint64_t amount)
{
  allowances_index allowances(_self, from);
  auto found_allowance = allowances.find(to);

  return found_allowance != allowances.end() && amount <= found_allowance->amount;
}

void pay::add_allowance(account_name owner, account_name spender, uint64_t value)
{
  allowances_index allowances(_self, owner);
  auto found_allowance = allowances.find(spender);

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

void pay::sub_allowance(account_name owner, account_name spender, uint64_t value)
{
  allowances_index allowances(_self, owner);
  const auto& found_allowance = allowances.get(spender, "no allowance object found");
  eosio_assert(found_allowance.amount >= value, "overdrawn amount");

  if(found_allowance.amount == value) {
    allowances.erase(found_allowance);
  } else {
    allowances.modify(found_allowance, _self, [&](auto& allowance) {
      allowance.amount -= value;
    });
  }
}

void pay::sub_balance(account_name owner, uint64_t value)  
{
  accounts_index accounts(_self, _self);
  const auto& found_account = accounts.get(owner, "no balance object found");
  eosio_assert(found_account.balance >= value, "overdrawn balance");

  if(found_account.balance == value) {
    accounts.erase(found_account);
  } else {
    accounts.modify(found_account, _self, [&](auto& account) {
      account.balance -= value;
    });
  }
}

void pay::add_balance(account_name owner, uint64_t value)
{
  accounts_index accounts(_self, _self);
  auto found_account = accounts.find(owner);

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

EOSIO_ABI(heymate::pay, (mint)(approve)(transferto)(transfer))
