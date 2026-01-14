from rest_framework.exceptions import NotFound
from ...utils.clm_init import clm_init
from ...models import FourFtResult

class RuleService:
    """Service class for rule operations"""
    
    @staticmethod
    def get_rule_with_details(four_ft_id, rule_id):
        """
        Get a rule with its details from a FourFtResult.
        
        Args:
            four_ft_id: The ID of the FourFtResult
            rule_id: The ID of the rule
            
        Returns:
            dict: The rule details
            
        Raises:
            NotFound: If the FourFtResult or rule does not exist
        """
        # Get the FourFtResult
        obj = FourFtResult.objects.filter(id=four_ft_id).first()
        
        if not obj:
            raise NotFound(f'FourFtResult with id {four_ft_id} was not found.')
        if not obj.storage_file:
            raise NotFound(f'FourFtResult with id {four_ft_id} does not contain rule {rule_id}.')
        
        # Initialize the CLM
        clm = clm_init(obj.storage_file)
        rules = clm.result['rules']
        
        if rule_id < 1 or rule_id > len(rules):
            raise NotFound(f'Rule with id {rule_id} was not found.')
        
        # Find the rule with the given ID
        rule = next((rule for rule in rules if rule['rule_id'] == rule_id), None)
        if not rule:
            raise NotFound(f'Rule with id {rule_id} was not found.')
        
        # Add rule text
        rule['rule_text'] = clm.get_ruletext(rule_id)
        
        return {
            'rule': rule,
            'clm': clm,
            'rule_id': rule_id
        }
    
    @staticmethod
    def add_rule_text_to_rules(clm):
        """
        Add rule text to each rule in the CleverMiner result.
        
        Args:
            clm: The CleverMiner instance
            
        Returns:
            None: The rules are modified in-place
        """
        for rule in clm.rulelist:
            rule['ruletext'] = clm.get_ruletext(rule['rule_id']) 