from rest_framework import serializers

class CedentsStrSerializer(serializers.Serializer):
    cond = serializers.CharField()
    ante = serializers.CharField()
    succ = serializers.CharField()

class ParamsSerializer(serializers.Serializer):
    base = serializers.FloatField()
    rel_base = serializers.FloatField()
    conf = serializers.FloatField()
    aad = serializers.FloatField()
    bad = serializers.FloatField()
    fourfold = serializers.ListField(child=serializers.FloatField())

class RuleSerializer(serializers.Serializer):
    rule_id = serializers.IntegerField()
    cedents_str = CedentsStrSerializer()
    params = ParamsSerializer()
    rule_text = serializers.CharField()

class RuleDataSerializer(serializers.Serializer):
    rule = RuleSerializer()
    plot = serializers.CharField()  # Base64 image stored as a string
